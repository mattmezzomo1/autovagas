# AutoVagas Chrome Extension

Extensão Chrome para automatização de aplicações em vagas de emprego para usuários do plano Básico do AutoVagas.

## 📋 Visão Geral

A extensão AutoVagas permite que usuários do plano Básico automatizem suas aplicações para vagas de emprego diretamente no navegador, usando o processamento local da máquina do usuário. Isso alivia a carga dos servidores e oferece uma solução econômica para automação de aplicações.

## 🎯 Funcionalidades

### ✅ Plataformas Suportadas
- **LinkedIn** - Aplicação via Easy Apply
- **InfoJobs** - Aplicação automática em vagas compatíveis
- **Catho** - Busca e aplicação automatizada
- **Indeed** - Aplicação em vagas relevantes
- **Vagas.com** - Automação completa de aplicações

### 🤖 Recursos de Automação
- **Auto-aplicação inteligente** com até 50 aplicações/mês
- **Filtros personalizáveis** por palavras-chave e localização
- **Detecção anti-bot** com delays humanizados
- **Pular vagas já aplicadas** automaticamente
- **Relatórios em tempo real** de atividade

### 🔐 Autenticação e Segurança
- **Login integrado** com a API do AutoVagas
- **Tokens seguros** para autenticação
- **Dados locais** processados na máquina do usuário
- **Comunicação criptografada** com servidores

## 🚀 Instalação

### Para Desenvolvimento
1. Clone este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta `autovagas-chrome-extension`

### Para Usuários (Chrome Web Store)
1. Acesse a [Chrome Web Store](https://chrome.google.com/webstore)
2. Busque por "AutoVagas"
3. Clique em "Adicionar ao Chrome"
4. Confirme a instalação

## 📖 Como Usar

### 1. Primeiro Acesso
1. Clique no ícone da extensão na barra de ferramentas
2. Faça login com suas credenciais do AutoVagas
3. Configure suas preferências de busca

### 2. Configuração
- **Plataformas**: Escolha quais sites usar
- **Palavras-chave**: Defina termos de busca
- **Localização**: Configure cidades ou "Remoto"
- **Delay**: Tempo entre aplicações (recomendado: 5s)

### 3. Ativação
1. Navegue para uma plataforma de emprego suportada
2. Clique no toggle "Ativar" na extensão
3. A automação iniciará automaticamente
4. Monitore o progresso no popup da extensão

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
autovagas-chrome-extension/
├── manifest.json              # Configuração da extensão
├── background.js              # Service worker principal
├── popup/
│   ├── popup.html            # Interface do usuário
│   ├── popup.css             # Estilos da interface
│   └── popup.js              # Lógica da interface
├── content-scripts/
│   ├── linkedin.js           # Scraper do LinkedIn
│   ├── infojobs.js           # Scraper do InfoJobs
│   ├── catho.js              # Scraper do Catho
│   ├── indeed.js             # Scraper do Indeed
│   └── vagas.js              # Scraper do Vagas.com
├── utils/
│   └── common.js             # Utilitários compartilhados
├── icons/
│   ├── icon16.png            # Ícone 16x16
│   ├── icon32.png            # Ícone 32x32
│   ├── icon48.png            # Ícone 48x48
│   └── icon128.png           # Ícone 128x128
└── README.md                 # Este arquivo
```

### Componentes Principais

#### Background Script (`background.js`)
- Gerencia autenticação com a API
- Coordena comunicação entre components
- Mantém estado global da extensão
- Processa estatísticas e limites

#### Content Scripts
- **LinkedIn**: Automação específica para LinkedIn
- **InfoJobs**: Scraper para InfoJobs Brasil
- **Catho**: Automação para Catho
- **Indeed**: Scraper para Indeed Brasil
- **Vagas.com**: Automação para Vagas.com

#### Popup Interface
- Interface de usuário principal
- Login e configurações
- Monitoramento em tempo real
- Estatísticas de uso

## 🔧 Desenvolvimento

### Pré-requisitos
- Chrome 88+ ou Edge 88+
- Node.js 16+ (para desenvolvimento)
- Conta ativa no AutoVagas

### Setup Local
```bash
# Clone o repositório
git clone https://github.com/autovagas/chrome-extension.git
cd autovagas-chrome-extension

# Configure a API local (opcional)
# Edite background.js para apontar para localhost:3000
```

### Debugging
1. Abra `chrome://extensions/`
2. Encontre a extensão AutoVagas
3. Clique em "Detalhes"
4. Use "Inspecionar visualizações" para debug

### Logs
- **Background**: Console do service worker
- **Content Scripts**: Console da página web
- **Popup**: Console do popup (F12 no popup)

## 📊 Limitações e Considerações

### Limites do Plano Básico
- **50 aplicações por mês** máximo
- **Processamento local** (depende da máquina do usuário)
- **Controle manual** de quando usar
- **Sem funcionamento 24/7** (apenas quando ativo)

### Considerações Técnicas
- **Dependente do DOM** das plataformas
- **Sujeito a mudanças** nos sites de emprego
- **Requer navegador aberto** para funcionar
- **Detecção anti-bot** pode limitar velocidade

### Boas Práticas
- Use delays adequados entre aplicações
- Monitore regularmente para evitar bloqueios
- Mantenha perfis atualizados nas plataformas
- Configure filtros específicos para melhor targeting

## 🔒 Privacidade e Segurança

### Dados Coletados
- **Credenciais de login** (criptografadas)
- **Estatísticas de uso** (anônimas)
- **Configurações pessoais** (locais)
- **Histórico de aplicações** (local)

### Proteção de Dados
- **Tokens JWT** para autenticação segura
- **Dados locais** não compartilhados
- **Comunicação HTTPS** com servidores
- **Sem armazenamento** de senhas

## 🐛 Solução de Problemas

### Problemas Comuns

#### Extensão não funciona
1. Verifique se está logado
2. Confirme se tem plano Básico ativo
3. Recarregue a página da plataforma
4. Reinicie o navegador

#### Aplicações não enviadas
1. Verifique se atingiu o limite mensal
2. Confirme se os filtros estão corretos
3. Verifique se a plataforma mudou o layout
4. Tente aumentar o delay entre aplicações

#### Login não funciona
1. Verifique credenciais no site principal
2. Limpe cache e cookies
3. Desative outras extensões temporariamente
4. Contate o suporte

### Logs de Debug
Para ativar logs detalhados:
1. Abra o console da extensão
2. Execute: `localStorage.setItem('debug', 'true')`
3. Recarregue a extensão

## 📞 Suporte

### Canais de Suporte
- **Email**: suporte@autovagas.com
- **Chat**: Disponível no site principal
- **FAQ**: https://autovagas.com/faq
- **GitHub Issues**: Para bugs técnicos

### Informações para Suporte
Ao reportar problemas, inclua:
- Versão da extensão
- Versão do navegador
- Plataforma onde ocorreu o erro
- Logs do console (se possível)
- Passos para reproduzir o problema

## 📄 Licença

Esta extensão é propriedade da AutoVagas e está licenciada apenas para usuários ativos da plataforma. O uso é restrito aos termos de serviço do AutoVagas.

## 🔄 Atualizações

A extensão é atualizada automaticamente via Chrome Web Store. Principais tipos de atualizações:

- **Correções de bugs** nos scrapers
- **Novos recursos** e melhorias
- **Adaptações** para mudanças nas plataformas
- **Melhorias de segurança** e performance

---

**Versão**: 1.0.0  
**Última atualização**: 2024  
**Compatibilidade**: Chrome 88+, Edge 88+
