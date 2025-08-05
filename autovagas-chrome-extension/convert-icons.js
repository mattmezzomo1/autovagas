
// Script para converter SVG para PNG usando Sharp
// Execute: npm install sharp && node convert-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

async function convertIcons() {
  console.log('🔄 Convertendo SVG para PNG...');
  
  for (const size of sizes) {
    try {
      const svgPath = path.join(__dirname, 'icons', `icon${size}.svg`);
      const pngPath = path.join(__dirname, 'icons', `icon${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(`✅ Convertido: icon${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao converter icon${size}.png:`, error.message);
    }
  }
  
  console.log('\n🎉 Conversão concluída!');
}

convertIcons();
