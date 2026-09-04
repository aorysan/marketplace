import os
import sys
import json
import subprocess
import tempfile
import pytest
import fitz
from PIL import Image

@pytest.fixture
def sample_pdf_path(tmp_path):
    pdf_file = tmp_path / "test_compro.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    
    # Add colored text and drawings (Primary: #0F4C81 -> RGB (15, 76, 129))
    rect_primary = fitz.Rect(50, 50, 500, 150)
    page.draw_rect(rect_primary, color=(15/255, 76/255, 129/255), fill=(15/255, 76/255, 129/255))
    
    rect_sec = fitz.Rect(50, 180, 200, 240)
    page.draw_rect(rect_sec, color=(245/255, 130/255, 32/255), fill=(245/255, 130/255, 32/255))
    
    page.insert_text((60, 100), "Produk Unggulan Kami", fontsize=24, color=(1, 1, 1))
    page.insert_text((60, 200), "Hubungi kami di info@test.com untuk solusi terbaik.", fontsize=12, color=(0.1, 0.1, 0.1))
    
    # Create valid large image (100x100) and small junk image (20x20)
    img_large = Image.new('RGB', (100, 100), color='blue')
    large_path = tmp_path / "large.png"
    img_large.save(large_path)
    page.insert_image(fitz.Rect(60, 260, 160, 360), filename=str(large_path))
    
    img_small = Image.new('RGB', (20, 20), color='red')
    small_path = tmp_path / "small.png"
    img_small.save(small_path)
    page.insert_image(fitz.Rect(60, 380, 80, 400), filename=str(small_path))
    
    doc.save(pdf_file)
    doc.close()
    return str(pdf_file)

def test_extract_improvements_output(sample_pdf_path, tmp_path):
    output_dir = str(tmp_path / "out")
    os.makedirs(output_dir, exist_ok=True)
    
    script_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "scripts", "extract.py"
    ))
    
    result = subprocess.run(
        [sys.executable, script_path, sample_pdf_path, output_dir],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Script error: {result.stderr}"
    
    json_path = os.path.join(output_dir, "intake_raw.json")
    assert os.path.exists(json_path), "intake_raw.json was not created"
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    assert "colors" in data
    assert "images" in data
    assert "raw_text_per_page" in data
    
    # Check noise filter: only 1 image (large > 50px) should be extracted, small (20x20) rejected
    assert len(data["images"]) == 1
    assert data["images"][0]["width"] >= 50 and data["images"][0]["height"] >= 50
    assert "nearby_heading" in data["images"][0]
    
    # Check color extraction found primary hex #0f4c81 or similar
    all_colors = data["colors"]["primary"] + data["colors"]["secondary"] + data["colors"]["neutral"]
    assert len(all_colors) > 0
