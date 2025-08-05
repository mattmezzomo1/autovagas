# Infraestrutura de Scraping - AutoVagas

Este documento descreve a implementação da infraestrutura de scraping no projeto AutoVagas, incluindo o sistema de filas, cache e circuit breaker.

## 1. Visão Geral

A infraestrutura de scraping é composta por três componentes principais:

1. **Sistema de Filas**: Gerencia as requisições de scraping, priorizando-as e limitando o número de requisições concorrentes.
2. **Sistema de Cache**: Armazena resultados de scraping para reduzir o número de requisições e melhorar o desempenho.
3. **Circuit Breaker**: Protege o sistema contra falhas em cascata, interrompendo temporariamente as requisições para plataformas com problemas.

## 2. Sistema de Filas

### 2.1. Funcionalidades

- Enfileiramento de tarefas de busca de vagas e aplicação em vagas
- Priorização de tarefas (aplicações têm prioridade sobre buscas)
- Limitação do número de tarefas concorrentes
- Retry automático em caso de falha
- Monitoramento do status das tarefas

### 2.2. Implementação

O sistema de filas é implementado na classe `ScraperQueueService`, que gerencia uma fila de tarefas e as processa de acordo com sua prioridade e o estado do circuit breaker.

```typescript
// Exemplo de uso
const queueService = new ScraperQueueService();

// Adiciona uma tarefa de busca de vagas à fila
const taskId = await queueService.enqueueJobSearch('linkedin', {
  keywords: ['desenvolvedor', 'javascript'],
  locations: ['São Paulo']
});

// Verifica o status da tarefa
const task = queueService.getTaskStatus(taskId);
```

## 3. Sistema de Cache

### 3.1. Funcionalidades

- Armazenamento em memória de resultados de scraping
- TTL (Time-To-Live) configurável para cada entrada
- Limpeza automática de entradas expiradas
- Invalidação seletiva de cache por plataforma ou operação

### 3.2. Implementação

O sistema de cache é implementado na classe `ScraperCacheService`, que gerencia um mapa de entradas de cache com expiração.

```typescript
// Exemplo de uso
const cacheService = new ScraperCacheService();

// Gera uma chave de cache
const cacheKey = cacheService.generateCacheKey('linkedin', 'search', {
  keywords: ['desenvolvedor', 'javascript'],
  locations: ['São Paulo']
});

// Armazena um valor no cache (TTL de 30 minutos por padrão)
await cacheService.set(cacheKey, results);

// Obtém um valor do cache
const cachedResults = await cacheService.get(cacheKey);

// Invalida cache de uma plataforma
await cacheService.invalidatePlatformCache('linkedin');
```

## 4. Circuit Breaker

### 4.1. Funcionalidades

- Monitoramento de falhas em requisições para plataformas
- Interrupção temporária de requisições para plataformas com problemas
- Tentativa gradual de recuperação
- Proteção contra falhas em cascata

### 4.2. Implementação

O circuit breaker é implementado na classe `CircuitBreaker`, que monitora falhas em requisições e interrompe temporariamente as requisições quando um limite é atingido.

```typescript
// Exemplo de uso
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000, // 30 segundos
  halfOpenSuccessThreshold: 2
});

// Executa uma função protegida pelo circuit breaker
try {
  const result = await circuitBreaker.execute(async () => {
    // Função que pode falhar
    return await api.call();
  });
} catch (error) {
  // Trata o erro
}
```

## 5. Integração com Scrapers

Os scrapers de cada plataforma (LinkedIn, InfoJobs, Catho, Indeed) são integrados com a infraestrutura de scraping através do `ScraperQueueService`, que gerencia as requisições para cada plataforma.

```typescript
// Exemplo de integração
const queueService = new ScraperQueueService();

// Adiciona uma tarefa de busca de vagas à fila
const taskId = await queueService.enqueueJobSearch('linkedin', {
  keywords: ['desenvolvedor', 'javascript'],
  locations: ['São Paulo']
});

// Adiciona uma tarefa de aplicação para vaga à fila
const applicationTaskId = await queueService.enqueueJobApplication('linkedin', job, profile);
```

## 6. API REST

A infraestrutura de scraping é exposta através de uma API REST, implementada no controlador `ScraperController` e nas rotas `scraper.routes.ts`.

### 6.1. Endpoints

- `POST /api/scraper/:platform/search`: Busca vagas em uma plataforma específica
- `POST /api/scraper/:platform/apply`: Aplica para uma vaga em uma plataforma específica
- `GET /api/scraper/task/:taskId`: Verifica o status de uma tarefa

### 6.2. Exemplo de Uso

```javascript
// Busca vagas no LinkedIn
const response = await fetch('/api/scraper/linkedin/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keywords: ['desenvolvedor', 'javascript'],
    locations: ['São Paulo']
  })
});

const { taskId } = await response.json();

// Verifica o status da tarefa
const statusResponse = await fetch(`/api/scraper/task/${taskId}`);
const taskStatus = await statusResponse.json();
```

## 7. Considerações de Desempenho e Escalabilidade

- O sistema de filas limita o número de requisições concorrentes para evitar sobrecarga
- O sistema de cache reduz o número de requisições repetidas
- O circuit breaker protege contra falhas em cascata
- A implementação atual é em memória, mas pode ser facilmente adaptada para usar um banco de dados ou serviço de filas externo para maior escalabilidade

## 8. Manutenção e Monitoramento

- Monitore o tamanho da fila e o tempo de processamento das tarefas
- Ajuste os parâmetros do circuit breaker conforme necessário
- Monitore a taxa de acertos do cache e ajuste o TTL conforme necessário
- Implemente logging detalhado para facilitar a depuração
