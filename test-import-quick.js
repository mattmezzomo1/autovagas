// Teste rápido de importação
console.log('🧪 Testando importação do documentService...\n');

const fs = require('fs');
const path = require('path');

// 1. Verificar se o arquivo existe
const documentServicePath = path.join(__dirname, 'src/services/document.service.ts');
console.log('📁 Verificando arquivo:', documentServicePath);

if (fs.existsSync(documentServicePath)) {
  console.log('✅ Arquivo document.service.ts existe');
  
  // 2. Verificar conteúdo do arquivo
  const content = fs.readFileSync(documentServicePath, 'utf8');
  
  // Verificar exportação
  if (content.includes('export const documentService')) {
    console.log('✅ Exportação "export const documentService" encontrada');
  } else {
    console.log('❌ Exportação "export const documentService" NÃO encontrada');
  }
  
  // Verificar classe
  if (content.includes('class DocumentService')) {
    console.log('✅ Classe DocumentService encontrada');
  } else {
    console.log('❌ Classe DocumentService NÃO encontrada');
  }
  
  // Verificar métodos principais
  const methods = ['saveResume', 'getResume', 'improveResumeWithAI', 'uploadResumePDF'];
  methods.forEach(method => {
    if (content.includes(method)) {
      console.log(`✅ Método ${method} encontrado`);
    } else {
      console.log(`❌ Método ${method} NÃO encontrado`);
    }
  });
  
} else {
  console.log('❌ Arquivo document.service.ts NÃO existe');
}

// 3. Verificar importação no Dashboard
const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.tsx');
console.log('\n📄 Verificando Dashboard.tsx...');

if (fs.existsSync(dashboardPath)) {
  console.log('✅ Arquivo Dashboard.tsx existe');
  
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  // Verificar importação
  if (dashboardContent.includes("import { documentService } from '../services/document.service'")) {
    console.log('✅ Importação correta encontrada no Dashboard');
  } else if (dashboardContent.includes('documentService')) {
    console.log('⚠️  documentService mencionado, mas importação pode estar incorreta');
    
    // Mostrar linha da importação
    const lines = dashboardContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('documentService')) {
        console.log(`   Linha ${index + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log('❌ documentService NÃO encontrado no Dashboard');
  }
} else {
  console.log('❌ Arquivo Dashboard.tsx NÃO existe');
}

// 4. Verificar se há arquivos .js conflitantes
console.log('\n🔍 Verificando arquivos conflitantes...');

const conflictingFiles = [
  'src/services/document.service.js',
  'src/services/platformAuth.service.js'
];

conflictingFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  CONFLITO: ${file} existe (pode causar problema)`);
  } else {
    console.log(`✅ ${file} não existe (bom)`);
  }
});

console.log('\n🎯 Resultado do teste:');
console.log('Se todos os itens acima estão ✅, a importação deveria funcionar.');
console.log('Se há ❌ ou ⚠️, esses são os problemas a corrigir.');

console.log('\n💡 Próximos passos:');
console.log('1. Corrigir qualquer ❌ encontrado');
console.log('2. Remover arquivos conflitantes (⚠️)');
console.log('3. Reiniciar servidor: npm run dev');
console.log('4. Testar no navegador');

console.log('\n✨ Teste de importação concluído!');
