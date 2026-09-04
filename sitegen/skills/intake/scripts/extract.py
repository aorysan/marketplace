import sys
import os
import json
import math
import collections

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    from PIL import Image
except ImportError:
    Image = None

def _color_to_hex(val):
    if val is None:
        return None
    if isinstance(val, str):
        val_str = val.strip()
        if val_str.startswith("#") and len(val_str) == 7:
            return val_str.upper()
        return None
    if isinstance(val, int):
        r = (val >> 16) & 0xFF
        g = (val >> 8) & 0xFF
        b = val & 0xFF
        return f"#{r:02X}{g:02X}{b:02X}"
    if isinstance(val, float):
        v = int(round(max(0.0, min(1.0, val)) * 255))
        return f"#{v:02X}{v:02X}{v:02X}"
    if isinstance(val, (tuple, list)):
        if len(val) == 0:
            return None
        if all(isinstance(x, (int, float)) and 0.0 <= float(x) <= 1.0 for x in val):
            vals = [int(round(float(x) * 255)) for x in val]
        elif all(isinstance(x, (int, float)) and 0 <= float(x) <= 255 for x in val):
            vals = [int(round(float(x))) for x in val]
        else:
            return None
            
        if len(vals) == 1:
            r = g = b = vals[0]
        elif len(vals) == 3:
            r, g, b = vals[0], vals[1], vals[2]
        elif len(vals) == 4:
            c, m, y, k = [x / 255.0 for x in vals]
            r = int(round(255 * (1.0 - c) * (1.0 - k)))
            g = int(round(255 * (1.0 - m) * (1.0 - k)))
            b = int(round(255 * (1.0 - y) * (1.0 - k)))
        else:
            return None
        return f"#{r:02X}{g:02X}{b:02X}"
    return None

def _is_neutral_color(hex_str):
    if not hex_str or len(hex_str) != 7 or not hex_str.startswith("#"):
        return True
    try:
        r = int(hex_str[1:3], 16)
        g = int(hex_str[3:5], 16)
        b = int(hex_str[5:7], 16)
    except (ValueError, TypeError, IndexError) as e:
        sys.stderr.write(f"Warning: Could not parse hex color '{hex_str}': {e}\n")
        return True
        
    diff = max(r, g, b) - min(r, g, b)
    if diff <= 25:
        return True
    if max(r, g, b) < 30:
        return True
    if min(r, g, b) > 235 and diff <= 40:
        return True
    return False

def extract_colors_from_pdf(doc):
    all_hex_colors = []
    
    for page_idx, page in enumerate(doc):
        try:
            for item in page.get_drawings():
                try:
                    if "color" in item and item["color"] is not None:
                        c = _color_to_hex(item["color"])
                        if c:
                            all_hex_colors.append(c)
                    if "fill" in item and item["fill"] is not None:
                        c = _color_to_hex(item["fill"])
                        if c:
                            all_hex_colors.append(c)
                except (AttributeError, KeyError, TypeError, ValueError) as e:
                    sys.stderr.write(f"Warning: Failed processing drawing color on page {page_idx}: {e}\n")
        except (AttributeError, RuntimeError, TypeError) as e:
            sys.stderr.write(f"Warning: Failed retrieving drawings for page {page_idx}: {e}\n")
            
        try:
            text_dict = page.get_text("rawdict")
            for block in text_dict.get("blocks", []):
                if block.get("type") == 0:
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            try:
                                if "color" in span and span["color"] is not None:
                                    c = _color_to_hex(span["color"])
                                    if c:
                                        all_hex_colors.append(c)
                            except (AttributeError, KeyError, TypeError, ValueError) as e:
                                sys.stderr.write(f"Warning: Failed processing span color on page {page_idx}: {e}\n")
        except (AttributeError, KeyError, RuntimeError, TypeError) as e:
            sys.stderr.write(f"Warning: Failed retrieving rawdict text for page {page_idx}: {e}\n")
            
    counter = collections.Counter(all_hex_colors)
    neutral_list = []
    non_neutral_list = []
    
    for col, _ in counter.most_common():
        if _is_neutral_color(col):
            neutral_list.append(col)
        else:
            non_neutral_list.append(col)
            
    primary_list = []
    secondary_list = []
    
    if non_neutral_list:
        primary_list.append(non_neutral_list[0])
        if len(non_neutral_list) > 1:
            secondary_list.extend(non_neutral_list[1:])
            
    return {
        "primary": primary_list,
        "secondary": secondary_list,
        "neutral": neutral_list
    }

def _find_nearby_heading(page, img_rect):
    try:
        img_y0 = float(img_rect[1]) if img_rect is not None else float("inf")
    except (IndexError, TypeError, AttributeError, ValueError) as e:
        sys.stderr.write(f"Warning: Invalid img_rect for heading search: {e}\n")
        img_y0 = float("inf")
        
    candidates = []
    
    try:
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            if block.get("type") == 0:
                try:
                    bbox = block.get("bbox", (0, 0, 0, 0))
                    block_text_parts = []
                    max_size = 0.0
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text_val = span.get("text", "")
                            if text_val:
                                block_text_parts.append(text_val.strip())
                            size_val = span.get("size", 0.0)
                            if size_val > max_size:
                                max_size = size_val
                    full_text = " ".join(part for part in block_text_parts if part).strip()
                    if full_text:
                        candidates.append({
                            "text": full_text,
                            "y0": float(bbox[1]),
                            "y1": float(bbox[3]),
                            "size": float(max_size)
                        })
                except (AttributeError, KeyError, ValueError, TypeError) as e:
                    sys.stderr.write(f"Warning: Error parsing text block for heading: {e}\n")
    except (AttributeError, RuntimeError, TypeError, KeyError) as e:
        sys.stderr.write(f"Warning: Could not retrieve dict text for heading search: {e}\n")
        
    if not candidates:
        try:
            raw_blocks = page.get_text("blocks")
            for b in raw_blocks:
                if len(b) >= 5 and str(b[4]).strip():
                    candidates.append({
                        "text": str(b[4]).strip().replace("\n", " "),
                        "y0": float(b[1]),
                        "y1": float(b[3]),
                        "size": 12.0
                    })
        except (AttributeError, RuntimeError, TypeError, IndexError) as e:
            sys.stderr.write(f"Warning: Fallback block search failed: {e}\n")
            
    if not candidates:
        return ""
        
    above_candidates = [c for c in candidates if c["y0"] <= img_y0 + 20]
    if not above_candidates:
        above_candidates = candidates
        
    above_candidates.sort(key=lambda x: (round(x["size"]), x["y0"]), reverse=True)
    return above_candidates[0]["text"]

def extract_images_with_pixmap(doc, out_dir=None):
    out_dir = out_dir or os.getcwd()
    if not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
        
    extracted_images = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        backup_rects = []
        try:
            td = page.get_text("dict")
            for b in td.get("blocks", []):
                if b.get("type") == 1 and "bbox" in b:
                    backup_rects.append(b["bbox"])
        except (AttributeError, KeyError, RuntimeError, TypeError) as e:
            sys.stderr.write(f"Warning: Could not extract backup image block rects on page {page_num}: {e}\n")
            
        image_list = page.get_images()
        for img_idx, img_info in enumerate(image_list):
            try:
                xref = img_info[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.width < 50 or pix.height < 50:
                    continue
                    
                if pix.n >= 5 or (pix.colorspace and pix.colorspace.n >= 4) or (pix.colorspace and pix.colorspace.name not in (fitz.csRGB.name, fitz.csGRAY.name)):
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                ext = "png" if pix.alpha else "jpg"
                filename = f"img_p{page_num}_{xref}.{ext}"
                filepath = os.path.join(out_dir, filename)
                pix.save(filepath)
                    
                img_rect = None
                try:
                    if hasattr(page, "get_image_rects"):
                        rects = page.get_image_rects(xref)
                        if rects:
                            img_rect = rects[0]
                except (AttributeError, RuntimeError, TypeError, IndexError) as e:
                    sys.stderr.write(f"Warning: Could not get image rects for xref {xref} on page {page_num}: {e}\n")
                    
                if img_rect is None and img_idx < len(backup_rects):
                    img_rect = backup_rects[img_idx]
                    
                heading_text = _find_nearby_heading(page, img_rect)
                
                extracted_images.append({
                    "file": filename,
                    "page": page_num,
                    "width": pix.width,
                    "height": pix.height,
                    "nearby_heading": heading_text
                })
            except (AttributeError, RuntimeError, ValueError, TypeError, IndexError, KeyError) as e:
                sys.stderr.write(f"Warning: Failed extracting pixmap for image {img_idx} on page {page_num}: {e}\n")
                continue
                
    return extracted_images

def extract_from_pdf(pdf_path, out_dir=None):
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found")
        sys.exit(1)
        
    if fitz is None:
        print("Error: PyMuPDF (fitz) module not installed")
        sys.exit(1)
        
    output_dir = out_dir or os.getcwd()

    doc = fitz.open(pdf_path)
    text_content = []
    raw_text_list = []
    
    asset_dir = os.path.join(output_dir, "assets")
    os.makedirs(asset_dir, exist_ok=True)
    
    img_count = 0
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text()
        text_content.append(page_text)
        raw_text_list.append({"page": page_num, "text": page_text})
        
        image_list = page.get_images(full=True)
        for _, img in enumerate(image_list):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                if base_image and "image" in base_image and "ext" in base_image:
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    img_count += 1
                    image_filename = os.path.join(asset_dir, f"extracted_img_{page_num}_{img_count}.{image_ext}")
                    with open(image_filename, "wb") as image_file:
                        image_file.write(image_bytes)
            except (AttributeError, KeyError, RuntimeError, ValueError, TypeError, IndexError) as e:
                sys.stderr.write(f"Warning: Failed conventional extraction of image xref on page {page_num}: {e}\n")
                continue
                
    print("=== EXTRACTED TEXT ===")
    print("\n".join(text_content))
    print("=== ASSETS SAVED ===")
    print(f"Saved {img_count} images to {asset_dir}")
    
    colors_dict = extract_colors_from_pdf(doc)
    images_list = extract_images_with_pixmap(doc, output_dir)
    
    data = {
        "colors": colors_dict,
        "images": images_list,
        "raw_text_per_page": raw_text_list
    }
    
    json_path = os.path.join(output_dir, "intake_raw.json")
    os.makedirs(output_dir, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    doc.close()
    return data

extract_pdf = extract_from_pdf

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract.py <pdf_path> [output_dir]")
        sys.exit(1)
    target_dir = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
    extract_from_pdf(sys.argv[1], target_dir)
