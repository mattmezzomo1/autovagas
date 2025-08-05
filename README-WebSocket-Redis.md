# WebSocket e Redis - Implementação Completa

## 📋 Visão Geral

Este documento descreve a implementação completa de WebSocket para chat em tempo real e Redis para cache de performance no sistema AutoVagas.

## 🚀 Funcionalidades Implementadas

### WebSocket (Chat em Tempo Real)
- ✅ Autenticação via JWT
- ✅ Salas de conversa por empresa/candidato
- ✅ Mensagens em tempo real
- ✅ Indicadores de digitação
- ✅ Status online/offline
- ✅ Notificações push
- ✅ Suporte a múltiplas instâncias via Redis Pub/Sub
- ✅ Reconexão automática
- ✅ Gestão de salas e usuários

### Redis (Cache de Performance)
- ✅ Cache distribuído com fallback para memória
- ✅ TTL configurável por tipo de dados
- ✅ Invalidação inteligente de cache
- ✅ Cache específico para dashboard, listas e analytics
- ✅ Middleware de cache automático
- ✅ Gestão de padrões de cache
- ✅ Estatísticas e monitoramento

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
src/
├── services/
│   ├── redis.service.js          # Serviço principal do Redis
│   ├── cache.service.js           # Serviço de cache com fallback
│   └── websocket.service.js       # Serviço de WebSocket
├── middleware/
│   └── cache.middleware.js        # Middleware de cache para rotas
├── api/routes/
│   ├── websocket.routes.js        # Rotas de gestão WebSocket
│   └── cache-management.routes.js # Rotas de gestão de cache
└── controllers/company/
    └── companyChat.controller.js  # Controlador integrado com WebSocket
```

### Fluxo de Dados

#### WebSocket
1. **Autenticação**: Cliente conecta com JWT token
2. **Salas**: Usuário entra em salas baseadas no role (company/candidate)
3. **Mensagens**: Mensagens são enviadas via WebSocket e persistidas no banco
4. **Broadcast**: Mensagens são distribuídas via Redis Pub/Sub para múltiplas instâncias
5. **Notificações**: Usuários offline recebem notificações push

#### Cache
1. **Requisição**: Cliente faz requisição para API
2. **Cache Check**: Middleware verifica se dados estão em cache
3. **Cache Hit**: Retorna dados do cache (Redis ou memória)
4. **Cache Miss**: Executa lógica normal e cacheia resultado
5. **Invalidação**: Operações de escrita invalidam cache relacionado

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Redis Configuration
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Cache Configuration
CACHE_ENABLED=true
CACHE_TTL=3600000
CACHE_MAX_SIZE=1000
```

### Docker Compose
```yaml
redis:
  image: redis:7-alpine
  container_name: autovagas-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
  volumes:
    - redis-data:/data
```

## 📡 API Endpoints

### WebSocket Management
```
GET    /api/websocket/stats              # Estatísticas do WebSocket
GET    /api/websocket/user/:id/status    # Status de usuário
GET    /api/websocket/online-users       # Usuários online
POST   /api/websocket/send-to-user       # Enviar mensagem (admin)
POST   /api/websocket/broadcast          # Broadcast (admin)
POST   /api/websocket/disconnect-user    # Desconectar usuário (admin)
GET    /api/websocket/health             # Saúde do WebSocket
```

### Cache Management
```
GET    /api/cache-management/stats       # Estatísticas do cache
GET    /api/cache-management/redis/info  # Informações do Redis
DELETE /api/cache-management/key/:key    # Remover chave específica
DELETE /api/cache-management/pattern     # Remover por padrão
DELETE /api/cache-management/company/:id # Invalidar cache da empresa
DELETE /api/cache-management/job/:id     # Invalidar cache da vaga
DELETE /api/cache-management/flush-all   # Limpar todo cache (admin)
GET    /api/cache-management/key/:key    # Obter valor da chave
PUT    /api/cache-management/key/:key    # Definir valor da chave
HEAD   /api/cache-management/key/:key    # Verificar se chave existe
GET    /api/cache-management/health      # Saúde do cache
```

## 🔌 Uso do WebSocket

### Cliente JavaScript
```javascript
// Conectar
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Entrar em conversa
socket.emit('join_conversation', { conversationId: 'conv-123' });

// Enviar mensagem
socket.emit('send_message', {
  conversationId: 'conv-123',
  content: 'Olá!',
  recipientId: 'user-456'
});

// Escutar mensagens
socket.on('new_message', (data) => {
  console.log('Nova mensagem:', data);
});

// Indicadores de digitação
socket.emit('typing_start', { conversationId: 'conv-123' });
socket.emit('typing_stop', { conversationId: 'conv-123' });

// Marcar como lida
socket.emit('mark_as_read', { 
  conversationId: 'conv-123',
  messageIds: ['msg-1', 'msg-2']
});
```

### Eventos Disponíveis
```javascript
// Eventos de entrada
'join_conversation'    // Entrar em conversa
'leave_conversation'   // Sair da conversa
'send_message'         // Enviar mensagem
'typing_start'         // Começar a digitar
'typing_stop'          // Parar de digitar
'mark_as_read'         // Marcar como lida

// Eventos de saída
'new_message'              // Nova mensagem
'new_message_notification' // Notificação de mensagem
'user_joined_conversation' // Usuário entrou
'user_left_conversation'   // Usuário saiu
'user_typing_start'        // Usuário digitando
'user_typing_stop'         // Usuário parou de digitar
'messages_read'            // Mensagens lidas
'user_status_change'       // Status do usuário mudou
'error'                    // Erro
```

## 💾 Uso do Cache

### Middleware Automático
```javascript
// Cache simples (5 minutos)
router.get('/data', CacheMiddleware.cache(300), controller.getData);

// Cache de dashboard (5 minutos)
router.get('/dashboard', CacheMiddleware.dashboardCache(300), controller.getDashboard);

// Cache de listas (10 minutos)
router.get('/jobs', CacheMiddleware.listCache('jobs', 600), controller.getJobs);

// Cache de analytics (30 minutos)
router.get('/analytics', CacheMiddleware.analyticsCache(1800), controller.getAnalytics);

// Invalidação automática
router.post('/jobs', CacheMiddleware.invalidateCache(['jobs:{companyUserId}*']), controller.createJob);
```

### Uso Programático
```javascript
const cacheService = require('./services/cache.service');

// Definir cache
await cacheService.set('key', data, 3600); // 1 hora

// Obter cache
const data = await cacheService.get('key');

// Remover cache
await cacheService.del('key');

// Cache específico para dashboard
await cacheService.cacheDashboardData(companyUserId, data, 300);
const dashboardData = await cacheService.getDashboardData(companyUserId);

// Invalidar cache da empresa
await cacheService.invalidateCompanyCache(companyUserId);
```

## 📊 Monitoramento

### Estatísticas WebSocket
```javascript
// Via API
GET /api/websocket/stats

// Resposta
{
  "connectedUsers": 150,
  "totalSockets": 150,
  "rooms": 45
}
```

### Estatísticas Cache
```javascript
// Via API
GET /api/cache-management/stats

// Resposta
{
  "redis": {
    "connected": true
  },
  "memory": {
    "size": 250,
    "ttlSize": 250,
    "maxSize": 1000
  }
}
```

## 🔧 Configurações de Performance

### TTL Recomendados
- **Dashboard**: 5 minutos (300s)
- **Listas**: 10 minutos (600s)
- **Analytics**: 30 minutos (1800s)
- **Perfis**: 10 minutos (600s)
- **Atividades**: 3 minutos (180s)

### Padrões de Invalidação
- **Criação de vaga**: `jobs:{companyUserId}*`, `dashboard:{companyUserId}*`
- **Atualização de candidato**: `candidates:{companyUserId}*`
- **Nova mensagem**: `conversations:{companyUserId}*`, `messages:{conversationId}*`

## 🚨 Tratamento de Erros

### WebSocket
- Reconexão automática em caso de desconexão
- Fallback para polling se WebSocket falhar
- Timeout de conexão configurável
- Retry exponencial para reconexão

### Cache
- Fallback automático para memória se Redis falhar
- Limpeza automática de cache em memória
- Logs detalhados de erros
- Graceful degradation sem cache

## 🔒 Segurança

### WebSocket
- Autenticação obrigatória via JWT
- Validação de permissões por sala
- Rate limiting por usuário
- Sanitização de mensagens

### Cache
- Isolamento por empresa/usuário
- Validação de acesso a chaves
- Logs de acesso para auditoria
- Expiração automática de dados sensíveis

## 📝 Exemplo Completo

Veja o arquivo `public/websocket-client-example.html` para um exemplo completo de cliente WebSocket funcional.

## 🔄 Próximos Passos

1. **Implementar notificações push** para usuários offline
2. **Adicionar métricas avançadas** com Prometheus
3. **Implementar rate limiting** mais granular
4. **Adicionar compressão** para mensagens grandes
5. **Implementar clustering** para alta disponibilidade
