const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando ambiente de desenvolvimento...\n');

// Função para executar comandos
function runCommand(command, args, name, color) {
  const process = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname
  });

  process.stdout.on('data', (data) => {
    console.log(`${color}[${name}]${'\x1b[0m'} ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${color}[${name}]${'\x1b[0m'} ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`${color}[${name}]${'\x1b[0m'} Processo finalizado com código ${code}`);
  });

  return process;
}

// Cores para os logs
const colors = {
  backend: '\x1b[32m',  // Verde
  frontend: '\x1b[34m', // Azul
  reset: '\x1b[0m'
};

console.log('📦 Verificando se as dependências estão instaladas...');

// Verifica se node_modules existe
const fs = require('fs');
if (!fs.existsSync('./node_modules')) {
  console.log('📥 Instalando dependências...');
  const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  
  install.on('close', (code) => {
    if (code === 0) {
      startServices();
    } else {
      console.error('❌ Erro ao instalar dependências');
      process.exit(1);
    }
  });
} else {
  startServices();
}

function startServices() {
  console.log('\n🔧 Iniciando serviços...\n');
  
  // Inicia o backend
  console.log('🖥️  Iniciando servidor backend na porta 3000...');
  const backend = runCommand('node', ['server-test.js'], 'BACKEND', colors.backend);
  
  // Aguarda um pouco antes de iniciar o frontend
  setTimeout(() => {
    console.log('🌐 Iniciando servidor frontend...');
    const frontend = runCommand('npm', ['run', 'dev'], 'FRONTEND', colors.frontend);
    
    // Trata sinais de interrupção
    process.on('SIGINT', () => {
      console.log('\n🛑 Parando serviços...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Parando serviços...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
  }, 2000);
  
  // Mostra informações úteis
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Ambiente de desenvolvimento iniciado!');
    console.log('');
    console.log('📍 URLs importantes:');
    console.log('   Frontend: http://localhost:5173 ou http://localhost:5174');
    console.log('   Backend:  http://localhost:3000');
    console.log('   Health:   http://localhost:3000/api/health');
    console.log('   Admin:    http://localhost:3000/api/admin/*');
    console.log('');
    console.log('🔧 Para parar os serviços, pressione Ctrl+C');
    console.log('='.repeat(60) + '\n');
  }, 5000);
}
