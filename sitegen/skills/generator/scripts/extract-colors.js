import Vibrant from 'node-vibrant';
import fs from 'fs';
import path from 'path';

const imagePath = process.argv[2];

if (!imagePath) {
  console.error("Error: Mohon sertakan path ke file gambar logo.");
  console.error("Penggunaan: node scripts/extract-colors.js <path-ke-gambar>");
  process.exit(1);
}

const resolvedPath = path.resolve(imagePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: File tidak ditemukan di path: ${resolvedPath}`);
  process.exit(1);
}

async function extractColors() {
  try {
    const palette = await Vibrant.from(resolvedPath).getPalette();
    
    // Pemetaan standar ke semantik
    // Vibrant (paling mencolok) -> primary
    // LightVibrant atau Muted -> secondary
    // DarkVibrant atau DarkMuted -> dark
    
    const primary = palette.Vibrant?.hex || '#0066CC';
    const secondary = palette.LightVibrant?.hex || palette.Muted?.hex || '#004499';
    const dark = palette.DarkVibrant?.hex || palette.DarkMuted?.hex || '#001A33';

    const result = {
      primary,
      secondary,
      dark
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error saat mengekstrak warna:", err.message);
    process.exit(1);
  }
}

extractColors();
