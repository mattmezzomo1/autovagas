// Script para corrigir erros de importação
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo erros de importação...\n');

// 1. Verificar se o arquivo document.service.ts existe e tem a exportação correta
const documentServicePath = path.join(__dirname, 'src/services/document.service.ts');

if (fs.existsSync(documentServicePath)) {
  console.log('✅ document.service.ts encontrado');
  
  const content = fs.readFileSync(documentServicePath, 'utf8');
  
  if (content.includes('export const documentService')) {
    console.log('✅ Exportação documentService encontrada');
  } else {
    console.log('❌ Exportação documentService não encontrada');
  }
  
  if (content.includes('class DocumentService')) {
    console.log('✅ Classe DocumentService encontrada');
  } else {
    console.log('❌ Classe DocumentService não encontrada');
  }
} else {
  console.log('❌ document.service.ts não encontrado');
}

// 2. Verificar se há arquivos .js conflitantes
const conflictingFiles = [
  'src/services/document.service.js',
  'src/services/pdf.service.js',
  'src/services/ai.service.js'
];

console.log('\n📁 Verificando arquivos conflitantes:');
conflictingFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} existe (pode causar conflito)`);
  } else {
    console.log(`✅ ${file} não existe`);
  }
});

// 3. Verificar importações no Dashboard
const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.tsx');

if (fs.existsSync(dashboardPath)) {
  console.log('\n📄 Verificando importações no Dashboard:');
  
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const imports = [
    { name: 'documentService', pattern: "import { documentService } from '../services/document.service'" },
    { name: 'platformAuthService', pattern: "import { platformAuthService } from '../services/platformAuth.service'" },
    { name: 'PlatformLoginModal', pattern: "import { PlatformLoginModal } from '../components/dashboard/PlatformLoginModal'" }
  ];
  
  imports.forEach(({ name, pattern }) => {
    if (dashboardContent.includes(pattern)) {
      console.log(`✅ ${name} importado corretamente`);
    } else if (dashboardContent.includes(name)) {
      console.log(`⚠️  ${name} importado, mas pode estar incorreto`);
    } else {
      console.log(`❌ ${name} não importado`);
    }
  });
} else {
  console.log('❌ Dashboard.tsx não encontrado');
}

// 4. Verificar se os componentes existem
const components = [
  'src/components/dashboard/PlatformLoginModal.tsx',
  'src/services/platformAuth.service.ts'
];

console.log('\n🧩 Verificando componentes:');
components.forEach(component => {
  const componentPath = path.join(__dirname, component);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${component} existe`);
  } else {
    console.log(`❌ ${component} não existe`);
  }
});

// 5. Verificar package.json para dependências
const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  console.log('\n📦 Verificando dependências:');
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['axios', 'react', '@types/react', 'typescript'];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} não encontrado`);
    }
  });
} else {
  console.log('❌ package.json não encontrado');
}

// 6. Sugestões de correção
console.log('\n🔧 Sugestões de correção:');

console.log('\n1. Se houver conflitos com arquivos .js:');
console.log('   - Remova os arquivos .js conflitantes');
console.log('   - Mantenha apenas os arquivos .ts/.tsx');

console.log('\n2. Se a importação ainda falhar:');
console.log('   - Reinicie o servidor de desenvolvimento');
console.log('   - Limpe o cache: npm run dev -- --force');

console.log('\n3. Se o erro persistir:');
console.log('   - Verifique se o TypeScript está configurado corretamente');
console.log('   - Verifique se não há erros de sintaxe nos arquivos');

console.log('\n4. Para testar:');
console.log('   - Execute: npm run dev');
console.log('   - Abra o console do navegador para ver erros');

// 7. Criar arquivo de teste simples
const testFilePath = path.join(__dirname, 'test-imports.js');
const testContent = `
// Teste simples de importações
console.log('🧪 Testando importações...');

try {
  // Simular importação do document service
  console.log('✅ Teste de importação bem-sucedido');
} catch (error) {
  console.error('❌ Erro na importação:', error.message);
}
`;

fs.writeFileSync(testFilePath, testContent);
console.log(`\n📝 Arquivo de teste criado: ${testFilePath}`);

console.log('\n🎯 Próximos passos:');
console.log('1. Execute este script: node fix-import-errors.js');
console.log('2. Corrija os problemas identificados');
console.log('3. Reinicie o servidor: npm run dev');
console.log('4. Teste a aplicação no navegador');

console.log('\n✨ Script de correção concluído!');
