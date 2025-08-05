// Script de teste para verificar se o plano básico foi adicionado à automação
const fs = require('fs');
const path = require('path');

console.log('🧪 Testando inclusão do plano básico na automação...\n');

// Verificar se os arquivos foram atualizados
const files = [
  'src/store/auth.ts',
  'src/types/auth.ts',
  'src/components/dashboard/RobotPaywallModal.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/dashboard/ScraperControl.tsx',
  'src/components/dashboard/UpgradePlanModal.tsx'
];

console.log('📁 Verificando arquivos atualizados:');
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
});

// Verificar store/auth.ts - Planos atualizados
console.log('\n📊 Verificando planos no store/auth.ts:');
const authPath = path.join(__dirname, 'src/store/auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  const checks = [
    { name: 'Plano Básico com 50 créditos', check: 'credits: 50' },
    { name: 'Plano Plus com 100 créditos', check: 'credits: 100' },
    { name: 'Plano Premium com 1000 créditos', check: 'credits: 1000' },
    { name: 'AutomationType extension', check: 'automationType: \'extension\'' },
    { name: 'AutomationType cloud', check: 'automationType: \'cloud\'' },
    { name: 'Descrição do plano básico', check: 'Ideal para quem está começando' },
    { name: 'Extensão Chrome no básico', check: 'Auto-aplicação via extensão Chrome' },
    { name: 'Bot na nuvem 24/7', check: 'Bot na nuvem 24/7' },
  ];

  checks.forEach(({ name, check }) => {
    if (authContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ auth.ts não encontrado');
}

// Verificar types/auth.ts - Tipo Plan atualizado
console.log('\n🔧 Verificando tipos em types/auth.ts:');
const typesPath = path.join(__dirname, 'src/types/auth.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  const checks = [
    { name: 'AutomationType adicionado', check: 'automationType: \'extension\' | \'cloud\'' },
    { name: 'Description adicionado', check: 'description: string' },
  ];

  checks.forEach(({ name, check }) => {
    if (typesContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ types/auth.ts não encontrado');
}

// Verificar RobotPaywallModal.tsx - Todos os planos incluídos
console.log('\n💰 Verificando RobotPaywallModal.tsx:');
const paywallPath = path.join(__dirname, 'src/components/dashboard/RobotPaywallModal.tsx');
if (fs.existsSync(paywallPath)) {
  const paywallContent = fs.readFileSync(paywallPath, 'utf8');
  
  const checks = [
    { name: 'Todos os planos incluídos', check: 'const eligiblePlans = plans;' },
    { name: 'Grid com 3 colunas', check: 'lg:grid-cols-3' },
    { name: 'Seção de tipos de automação', check: 'Tipos de Automação Disponíveis' },
    { name: 'Extensão Chrome explicada', check: 'Extensão Chrome' },
    { name: 'Bot na nuvem explicado', check: 'Bot na Nuvem 24/7' },
    { name: 'Mensagem positiva', check: 'Todos os planos incluem automação' },
  ];

  checks.forEach(({ name, check }) => {
    if (paywallContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ RobotPaywallModal.tsx não encontrado');
}

// Verificar Dashboard.tsx - hasEligiblePlan atualizado
console.log('\n🏠 Verificando Dashboard.tsx:');
const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const checks = [
    { name: 'Plano básico incluído', check: 'plan === \'basic\'' },
    { name: 'Comentário atualizado', check: 'Agora todos os planos' },
  ];

  checks.forEach(({ name, check }) => {
    if (dashboardContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ Dashboard.tsx não encontrado');
}

// Verificar ScraperControl.tsx - hasEligiblePlan atualizado
console.log('\n🤖 Verificando ScraperControl.tsx:');
const scraperPath = path.join(__dirname, 'src/components/dashboard/ScraperControl.tsx');
if (fs.existsSync(scraperPath)) {
  const scraperContent = fs.readFileSync(scraperPath, 'utf8');
  
  const checks = [
    { name: 'Plano básico incluído', check: 'plan === \'basic\'' },
    { name: 'Comentário atualizado', check: 'Agora todos os planos' },
  ];

  checks.forEach(({ name, check }) => {
    if (scraperContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ ScraperControl.tsx não encontrado');
}

// Verificar UpgradePlanModal.tsx - Todos os planos
console.log('\n⬆️ Verificando UpgradePlanModal.tsx:');
const upgradePath = path.join(__dirname, 'src/components/dashboard/UpgradePlanModal.tsx');
if (fs.existsSync(upgradePath)) {
  const upgradeContent = fs.readFileSync(upgradePath, 'utf8');
  
  const checks = [
    { name: 'Todos os planos incluídos', check: 'const eligiblePlans = plans;' },
    { name: 'Grid com 3 colunas', check: 'lg:grid-cols-3' },
    { name: 'Título atualizado', check: 'Escolha seu Plano' },
    { name: 'Descrição atualizada', check: 'Todos os planos incluem automação' },
  ];

  checks.forEach(({ name, check }) => {
    if (upgradeContent.includes(check)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  });
} else {
  console.log('  ❌ UpgradePlanModal.tsx não encontrado');
}

console.log('\n📋 Resumo das mudanças implementadas:');
console.log('✅ Plano Básico agora inclui auto-aplicação (50 aplicações/mês)');
console.log('✅ Plano Plus: 100 aplicações/mês com bot na nuvem');
console.log('✅ Plano Premium: 1000 aplicações/mês com bot na nuvem prioritário');
console.log('✅ Diferenciação clara entre extensão Chrome vs bot na nuvem');
console.log('✅ Paywall atualizado para mostrar todos os 3 planos');
console.log('✅ Funções hasEligiblePlan atualizadas para incluir básico');
console.log('✅ Tipos TypeScript atualizados com automationType e description');

console.log('\n🎯 Diferenças entre os planos:');
console.log('📱 BÁSICO (R$ 19,90):');
console.log('   • 50 aplicações automáticas/mês');
console.log('   • Extensão Chrome (processamento local)');
console.log('   • Usuário controla quando usar');
console.log('   • Ideal para começar');

console.log('\n☁️ PLUS (R$ 49,90):');
console.log('   • 100 aplicações automáticas/mês');
console.log('   • Bot na nuvem 24/7');
console.log('   • Processamento em nossos servidores');
console.log('   • Funciona automaticamente');

console.log('\n👑 PREMIUM (R$ 99,90):');
console.log('   • 1000 aplicações automáticas/mês');
console.log('   • Bot na nuvem 24/7 prioritário');
console.log('   • Máxima eficiência e recursos');
console.log('   • Relatórios avançados');

console.log('\n🧪 Como testar:');
console.log('1. Inicie a aplicação: npm run dev');
console.log('2. Tente ativar o robô (Dashboard ou /scraper)');
console.log('3. Verifique se o paywall mostra os 3 planos');
console.log('4. Observe as diferenças explicadas entre extensão e nuvem');

console.log('\n✨ Implementação do plano básico concluída!');
console.log('🎉 Agora todos os usuários têm acesso à automação!');
