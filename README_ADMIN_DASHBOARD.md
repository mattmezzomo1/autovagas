# Dashboard Administrativo - Autovagas

Este documento descreve como executar e usar o dashboard administrativo do projeto Autovagas.

## 🚀 Como Executar

### Método 1: Execução Automática (Recomendado)

```bash
# Instala dependências e inicia frontend + backend automaticamente
npm run dev:full
```

### Método 2: Execução Manual

#### 1. Instalar Dependências

```bash
npm install
```

#### 2. Executar o Backend

```bash
# Servidor de teste simples (recomendado para desenvolvimento)
npm run server:test

# OU servidor NestJS completo (se configurado)
npm run server:dev
```

#### 3. Executar o Frontend

Em outro terminal:

```bash
npm run dev
```

### 3. Acessar o Dashboard

- Frontend: http://localhost:5173 ou http://localhost:5174
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

### 4. Configurar Supabase (Opcional)

Para funcionalidades completas, configure o arquivo `.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 🔧 Configuração do Supabase

Execute o script SQL fornecido em `migrations/system_settings.sql` no Supabase Dashboard para criar as tabelas necessárias.

## 📊 Funcionalidades do Dashboard

### Gerenciamento de Usuários
- ✅ Listar usuários com paginação e filtros
- ✅ Adicionar novos usuários
- ✅ Editar usuários existentes
- ✅ Atribuir/mudar planos de assinatura
- ✅ Excluir usuários

### Gerenciamento de Assinaturas
- ✅ Listar assinaturas com filtros
- ✅ Editar assinaturas
- ✅ Cancelar assinaturas
- ✅ Ver detalhes de pagamento

### Estatísticas
- ✅ Métricas gerais do sistema
- ✅ Distribuição de usuários por plano
- ✅ Receita mensal
- ✅ Atividades recentes

### Configurações do Sistema
- ✅ Configurações gerais
- ✅ Configurações de email
- ✅ Configurações de pagamento
- ✅ Configurações de scraper
- ✅ Configurações de notificações

## 🔐 Autenticação

Para acessar o dashboard administrativo, você precisa:

1. Criar um usuário com role 'admin' no Supabase
2. Fazer login com as credenciais de administrador
3. O token JWT será usado automaticamente nas requisições

## 🛠️ Estrutura do Projeto

```
src/
├── components/admin/          # Componentes do dashboard
├── pages/admin/              # Páginas administrativas
├── services/                 # Serviços de API
├── config/                   # Configurações
├── middleware/               # Middlewares do backend
├── controllers/admin/        # Controladores administrativos
├── services/admin/           # Serviços administrativos
└── routes/                   # Rotas da API
```

## 🐛 Troubleshooting

### Erro: "process is not defined"
- ✅ Corrigido: Configuração atualizada para usar Vite corretamente

### Erro: "The requested module does not provide an export"
- ✅ Corrigido: Imports atualizados para usar caminhos corretos

### Erro: "CORS"
- ✅ Corrigido: Proxy configurado no Vite

### Erro: "API não encontrada"
- Verifique se o servidor backend está rodando na porta 3000
- Teste o health check: http://localhost:3000/api/health

## 📝 Próximos Passos

1. **Implementar autenticação real**: Integrar com o sistema de auth existente
2. **Adicionar testes**: Criar testes unitários e de integração
3. **Melhorar UI/UX**: Adicionar mais animações e feedback visual
4. **Implementar cache**: Adicionar cache para melhorar performance
5. **Adicionar logs**: Implementar sistema de logs detalhado

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes se necessário
5. Faça um pull request

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se as variáveis de ambiente estão configuradas
3. Teste os endpoints da API individualmente
4. Verifique os logs do console para erros específicos
