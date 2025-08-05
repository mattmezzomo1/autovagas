// Script para gerar ícones PNG a partir do SVG
// Requer: npm install sharp (para conversão SVG -> PNG)

const fs = require('fs');
const path = require('path');

// Função para criar ícones PNG usando Canvas (fallback se sharp não estiver disponível)
function createIconWithCanvas(size) {
  // Este é um fallback básico - idealmente use sharp ou outro conversor
  const iconData = `
<svg width="${size}" height="${size}" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <circle cx="64" cy="64" r="60" fill="url(#bgGradient)" stroke="#ffffff" stroke-width="2"/>
  
  <g transform="translate(32, 28)">
    <rect x="16" y="8" width="32" height="28" rx="6" fill="url(#iconGradient)"/>
    <circle cx="26" cy="18" r="3" fill="#ffffff"/>
    <circle cx="38" cy="18" r="3" fill="#ffffff"/>
    <circle cx="26" cy="18" r="1.5" fill="#333333"/>
    <circle cx="38" cy="18" r="1.5" fill="#333333"/>
    <rect x="28" y="26" width="8" height="2" rx="1" fill="#ffffff"/>
    <rect x="31" y="2" width="2" height="8" fill="url(#iconGradient)"/>
    <circle cx="32" cy="2" r="2" fill="#ffffff"/>
    <rect x="12" y="36" width="40" height="32" rx="4" fill="url(#iconGradient)"/>
    <rect x="20" y="44" width="24" height="16" rx="2" fill="#ffffff" opacity="0.3"/>
    <rect x="4" y="40" width="8" height="20" rx="4" fill="url(#iconGradient)"/>
    <rect x="52" y="40" width="8" height="20" rx="4" fill="url(#iconGradient)"/>
    <circle cx="8" cy="64" r="4" fill="#ffffff"/>
    <circle cx="56" cy="64" r="4" fill="#ffffff"/>
    <rect x="20" y="68" width="6" height="16" rx="3" fill="url(#iconGradient)"/>
    <rect x="38" y="68" width="6" height="16" rx="3" fill="url(#iconGradient)"/>
    <ellipse cx="23" cy="86" rx="5" ry="3" fill="#ffffff"/>
    <ellipse cx="41" cy="86" rx="5" ry="3" fill="#ffffff"/>
  </g>
  
  ${size >= 64 ? '<text x="64" y="110" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="10" font-weight="bold">AutoVagas</text>' : ''}
</svg>`;

  return iconData;
}

// Tamanhos necessários para a extensão Chrome
const sizes = [16, 32, 48, 128];

console.log('🎨 Gerando ícones da extensão AutoVagas...\n');

// Cria o diretório de ícones se não existir
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Gera os ícones SVG para cada tamanho
sizes.forEach(size => {
  const iconSvg = createIconWithCanvas(size);
  const filename = `icon${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, iconSvg);
  console.log(`✅ Criado: ${filename}`);
});

console.log('\n📋 Ícones SVG criados com sucesso!');
console.log('\n💡 Para converter para PNG, você pode usar:');
console.log('1. Online: https://convertio.co/svg-png/');
console.log('2. Inkscape: inkscape --export-png=icon16.png --export-width=16 icon16.svg');
console.log('3. ImageMagick: convert icon16.svg -resize 16x16 icon16.png');
console.log('4. Sharp (Node.js): npm install sharp && node convert-icons.js');

// Cria um script adicional para conversão com Sharp
const sharpScript = `
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
      const svgPath = path.join(__dirname, 'icons', \`icon\${size}.svg\`);
      const pngPath = path.join(__dirname, 'icons', \`icon\${size}.png\`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(\`✅ Convertido: icon\${size}.png\`);
    } catch (error) {
      console.error(\`❌ Erro ao converter icon\${size}.png:\`, error.message);
    }
  }
  
  console.log('\\n🎉 Conversão concluída!');
}

convertIcons();
`;

fs.writeFileSync(path.join(__dirname, 'convert-icons.js'), sharpScript);
console.log('\n📄 Script de conversão criado: convert-icons.js');

console.log('\n🎯 Próximos passos:');
console.log('1. Instale o Sharp: npm install sharp');
console.log('2. Execute: node convert-icons.js');
console.log('3. Ou converta manualmente os SVGs para PNG');

console.log('\n📁 Estrutura de ícones:');
sizes.forEach(size => {
  console.log(`   icons/icon${size}.svg (criado)`);
  console.log(`   icons/icon${size}.png (para criar)`);
});
