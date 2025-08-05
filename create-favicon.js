// Script para criar um favicon.ico simples
const fs = require('fs');
const path = require('path');

console.log('🎨 Criando favicon.ico...\n');

// Dados de um favicon 16x16 simples (formato ICO)
// Este é um ícone roxo simples com um "A" branco no centro
const faviconData = Buffer.from([
  // ICO Header
  0x00, 0x00, // Reserved
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00, // Number of images
  
  // Image Directory Entry
  0x10, // Width (16)
  0x10, // Height (16)
  0x00, // Color count (0 = no palette)
  0x00, // Reserved
  0x01, 0x00, // Color planes
  0x20, 0x00, // Bits per pixel (32)
  0x80, 0x04, 0x00, 0x00, // Size of image data
  0x16, 0x00, 0x00, 0x00, // Offset to image data
  
  // Bitmap Info Header
  0x28, 0x00, 0x00, 0x00, // Header size
  0x10, 0x00, 0x00, 0x00, // Width
  0x20, 0x00, 0x00, 0x00, // Height (doubled for ICO)
  0x01, 0x00, // Planes
  0x20, 0x00, // Bits per pixel
  0x00, 0x00, 0x00, 0x00, // Compression
  0x00, 0x04, 0x00, 0x00, // Image size
  0x00, 0x00, 0x00, 0x00, // X pixels per meter
  0x00, 0x00, 0x00, 0x00, // Y pixels per meter
  0x00, 0x00, 0x00, 0x00, // Colors used
  0x00, 0x00, 0x00, 0x00, // Important colors
]);

// Adicionar dados de pixel simples (16x16 pixels, 32-bit RGBA)
const pixelData = [];

// Criar um ícone simples: fundo roxo com bordas mais claras
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    let r, g, b, a = 255;
    
    // Bordas
    if (x === 0 || x === 15 || y === 0 || y === 15) {
      r = 139; g = 92; b = 246; // Roxo claro
    }
    // Centro com "A" simples
    else if (
      (x >= 6 && x <= 9 && y >= 4 && y <= 11) || // Linha vertical
      (x >= 4 && x <= 11 && y >= 6 && y <= 7)    // Linha horizontal
    ) {
      r = 255; g = 255; b = 255; // Branco
    }
    // Fundo
    else {
      r = 99; g = 102; b = 241; // Roxo escuro
    }
    
    // ICO format é BGRA, bottom-up
    pixelData.push(b, g, r, a);
  }
}

// Inverter linhas (ICO é bottom-up)
const invertedPixelData = [];
for (let y = 15; y >= 0; y--) {
  for (let x = 0; x < 16; x++) {
    const index = (y * 16 + x) * 4;
    invertedPixelData.push(
      pixelData[index],     // B
      pixelData[index + 1], // G
      pixelData[index + 2], // R
      pixelData[index + 3]  // A
    );
  }
}

// Adicionar máscara AND (todos zeros para ícone opaco)
const andMask = new Array(32).fill(0); // 16x16 bits = 32 bytes

// Combinar tudo
const fullFaviconData = Buffer.concat([
  faviconData,
  Buffer.from(invertedPixelData),
  Buffer.from(andMask)
]);

// Salvar arquivo
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');

try {
  fs.writeFileSync(faviconPath, fullFaviconData);
  console.log('✅ favicon.ico criado com sucesso!');
  console.log(`📁 Localização: ${faviconPath}`);
  console.log(`📏 Tamanho: ${fullFaviconData.length} bytes`);
} catch (error) {
  console.error('❌ Erro ao criar favicon.ico:', error.message);
  
  // Fallback: criar um arquivo vazio
  console.log('🔄 Criando arquivo vazio como fallback...');
  fs.writeFileSync(faviconPath, Buffer.alloc(0));
  console.log('✅ Arquivo vazio criado');
}

console.log('\n🎯 Favicon criado!');
console.log('💡 Agora reinicie o servidor para testar');

// Verificar se os arquivos foram criados
console.log('\n📋 Verificando arquivos criados:');

const files = [
  'public/favicon.ico',
  'public/favicon.svg',
  'public/index.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
});

console.log('\n✨ Script de criação de favicon concluído!');
