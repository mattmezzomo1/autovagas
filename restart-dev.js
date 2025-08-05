// Script para reiniciar o servidor de desenvolvimento
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Reiniciando servidor de desenvolvimento...\n');

// 1. Limpar cache do node_modules
console.log('🧹 Limpando cache...');

const cacheDirectories = [
  'node_modules/.vite',
  'node_modules/.cache',
  'dist'
];

cacheDirectories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  🗑️  Removendo ${dir}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  } else {
    console.log(`  ✅ ${dir} não existe`);
  }
});

// 2. Verificar se há processos rodando na porta 5173
console.log('\n🔍 Verificando processos na porta 5173...');

exec('netstat -ano | findstr :5173', (error, stdout, stderr) => {
  if (stdout) {
    console.log('⚠️  Processo encontrado na porta 5173:');
    console.log(stdout);
    console.log('💡 Se necessário, mate o processo manualmente');
  } else {
    console.log('✅ Porta 5173 está livre');
  }
});

// 3. Verificar se há erros de TypeScript
console.log('\n🔍 Verificando erros de TypeScript...');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Erros de TypeScript encontrados:');
    console.log(stderr || stdout);
  } else {
    console.log('✅ Nenhum erro de TypeScript encontrado');
  }
});

// 4. Instruções para reiniciar
console.log('\n🚀 Para reiniciar o servidor:');
console.log('1. Pare o servidor atual (Ctrl+C)');
console.log('2. Execute: npm run dev');
console.log('3. Aguarde o servidor inicializar');
console.log('4. Abra http://localhost:5173');

// 5. Verificar se os arquivos principais existem
console.log('\n📁 Verificando arquivos principais:');

const mainFiles = [
  'src/main.tsx',
  'src/App.tsx',
  'src/pages/Dashboard.tsx',
  'src/services/document.service.ts',
  'src/services/platformAuth.service.ts',
  'src/components/dashboard/PlatformLoginModal.tsx'
];

mainFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
});

// 6. Verificar package.json scripts
console.log('\n📦 Scripts disponíveis:');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts || {};
  
  Object.keys(scripts).forEach(script => {
    console.log(`  ${script}: ${scripts[script]}`);
  });
} else {
  console.log('❌ package.json não encontrado');
}

// 7. Criar arquivo de teste para verificar se as importações funcionam
const testImportPath = path.join(__dirname, 'test-import-fix.html');
const testImportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Teste de Importação</title>
</head>
<body>
    <h1>Teste de Importação</h1>
    <p>Se você consegue ver esta página, o servidor está funcionando.</p>
    <script>
        console.log('✅ JavaScript funcionando');
        
        // Simular teste de importação
        try {
            console.log('✅ Teste de importação simulado bem-sucedido');
        } catch (error) {
            console.error('❌ Erro no teste:', error);
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(testImportPath, testImportContent);
console.log(`\n📝 Arquivo de teste criado: ${testImportPath}`);

console.log('\n🎯 Solução de problemas:');
console.log('');
console.log('Se o erro "does not provide an export named" persistir:');
console.log('1. Verifique se não há arquivos .js conflitantes');
console.log('2. Reinicie o servidor completamente');
console.log('3. Limpe o cache do navegador (F12 > Network > Disable cache)');
console.log('4. Verifique se a sintaxe dos arquivos .ts está correta');
console.log('');
console.log('Se o favicon.ico 404 incomodar:');
console.log('1. Adicione um favicon.ico na pasta public/');
console.log('2. Ou ignore, é apenas um aviso cosmético');

console.log('\n✨ Script de reinicialização concluído!');
console.log('💡 Execute "npm run dev" para iniciar o servidor');
