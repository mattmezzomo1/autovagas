# 🎯 Sistema de Treinamento de Entrevistas com IA

## Visão Geral

O sistema de treinamento de entrevistas utiliza a API da OpenAI para simular entrevistas realistas e fornecer feedback detalhado aos usuários. A IA atua como um entrevistador experiente, adaptando as perguntas baseado no perfil do usuário e fornecendo pontuação ao final.

## Funcionalidades

### 🤖 Entrevistador IA Inteligente
- **Personalização**: Baseado no currículo e perfil do usuário
- **Tipos de entrevista**: Técnica, Comportamental e Geral
- **Níveis de dificuldade**: Júnior, Pleno e Sênior
- **Adaptação dinâmica**: Perguntas se adaptam às respostas

### 📊 Sistema de Pontuação Detalhado
- **Pontuação geral**: 0-100 pontos
- **Categorias específicas**:
  - Técnico
  - Comunicação
  - Resolução de problemas
  - Confiança
- **Feedback construtivo**: Pontos fortes e áreas de melhoria

### 💬 Interface de Chat Realista
- **Chat em tempo real** com a IA
- **Histórico de mensagens** completo
- **Indicadores visuais** de status da sessão
- **Controles de sessão** (iniciar/finalizar)

## Como Usar

### 1. Acesso
- Clique no ícone de chat no header
- Ou acesse o card "Treinamento de Entrevista" no dashboard

### 2. Configuração da Entrevista
```typescript
// Parâmetros configuráveis
{
  type: 'technical' | 'behavioral' | 'general',
  position: string,        // Ex: "Desenvolvedor Full Stack"
  company: string,         // Ex: "TechCorp Inc."
  difficulty: 'junior' | 'mid' | 'senior'
}
```

### 3. Durante a Entrevista
- Responda às perguntas da IA naturalmente
- A IA se adapta às suas respostas
- Duração típica: 10-20 minutos

### 4. Pontuação Final
- Análise detalhada do desempenho
- Feedback específico por categoria
- Sugestões de melhoria

## Configuração Técnica

### Variáveis de Ambiente
```bash
# Frontend
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Backend (opcional)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Estrutura de Dados

#### InterviewSession
```typescript
interface InterviewSession {
  id: string;
  type: 'technical' | 'behavioral' | 'general';
  position: string;
  company: string;
  difficulty: 'junior' | 'mid' | 'senior';
  messages: InterviewMessage[];
  startTime: Date;
  endTime?: Date;
  score?: InterviewScore;
}
```

#### InterviewScore
```typescript
interface InterviewScore {
  overall: number;        // 0-100
  technical: number;      // 0-100
  communication: number;  // 0-100
  problemSolving: number; // 0-100
  confidence: number;     // 0-100
  feedback: string[];
  strengths: string[];
  improvements: string[];
}
```

## Prompts da IA

### Prompt Inicial
A IA recebe informações detalhadas do perfil do usuário:
- Nome e cargo atual
- Experiência profissional
- Habilidades técnicas
- Localização e expectativa salarial
- Biografia profissional

### Prompt de Avaliação
Ao final, a IA analisa toda a conversa e gera:
- Pontuações numéricas por categoria
- Feedback específico e construtivo
- Identificação de pontos fortes
- Sugestões de melhoria

## Fallbacks Inteligentes

### Sem API da OpenAI
- **Mensagens pré-definidas** contextuais
- **Respostas adaptativas** baseadas no tipo de entrevista
- **Pontuação algorítmica** baseada em participação e duração

### Exemplo de Fallback
```typescript
const fallbackResponses = {
  technical: [
    "Interessante abordagem! Pode me explicar como implementaria isso?",
    "Boa resposta! Conte sobre um desafio técnico recente.",
    "Como garantiria a performance dessa solução em escala?"
  ],
  behavioral: [
    "Pode dar um exemplo específico dessa situação?",
    "Como lidou com o feedback da equipe?",
    "Como aplicaria essa experiência aqui?"
  ]
};
```

## Armazenamento Local

### Persistência de Sessões
- **localStorage**: Histórico de entrevistas
- **Recuperação**: Sessões podem ser retomadas
- **Limite**: Últimas 10 sessões mantidas

### Estrutura de Dados Local
```typescript
// localStorage key: 'interviewSessions'
InterviewSession[] // Array de sessões
```

## Integração com o Sistema

### Header
- Botão de chat redirecionado para treinamento
- Tooltip explicativo da funcionalidade

### Dashboard
- Card promocional com benefícios
- Acesso direto ao treinamento
- Estatísticas de uso (futuro)

### Perfil do Usuário
- Dados utilizados para personalização
- Currículo como base para perguntas
- Habilidades influenciam tipo de entrevista

## Métricas e Analytics

### Dados Coletados
- Duração das sessões
- Tipos de entrevista mais populares
- Pontuações médias por categoria
- Frequência de uso

### Possíveis Melhorias
- **Histórico de progresso**: Acompanhar evolução
- **Recomendações personalizadas**: Baseado em pontuações
- **Integração com vagas**: Treinar para posições específicas
- **Modo multiplayer**: Entrevistas em grupo

## Segurança e Privacidade

### Dados Sensíveis
- **API Key**: Nunca exposta no frontend
- **Conversas**: Armazenadas localmente apenas
- **Perfil**: Usado apenas para personalização

### Boas Práticas
- Validação de entrada do usuário
- Rate limiting para API calls
- Fallbacks para falhas de rede
- Limpeza automática de dados antigos

## Custos da API

### OpenAI GPT-4
- **Modelo**: gpt-4
- **Tokens por sessão**: ~2000-3000
- **Custo estimado**: $0.06-0.09 por sessão
- **Otimizações**: Prompts concisos, cache de respostas

### Alternativas
- **GPT-3.5-turbo**: Mais barato, qualidade ligeiramente menor
- **Modelos locais**: Llama, Mistral (sem custos de API)
- **Híbrido**: IA para perguntas, algoritmo para pontuação

## Roadmap

### Versão 1.0 ✅
- [x] Chat básico com IA
- [x] Configuração de entrevista
- [x] Sistema de pontuação
- [x] Fallbacks sem IA

### Versão 1.1 (Próxima)
- [ ] Histórico de sessões na UI
- [ ] Gráficos de progresso
- [ ] Exportar resultados em PDF
- [ ] Mais tipos de entrevista

### Versão 2.0 (Futuro)
- [ ] Entrevistas por vídeo (speech-to-text)
- [ ] Análise de linguagem corporal
- [ ] Integração com calendário
- [ ] Modo colaborativo com RH

## Suporte e Troubleshooting

### Problemas Comuns
1. **API Key inválida**: Verificar configuração
2. **Rate limiting**: Implementar delays
3. **Respostas genéricas**: Melhorar prompts
4. **Sessões perdidas**: Verificar localStorage

### Debug
```typescript
// Habilitar logs detalhados
localStorage.setItem('interview_debug', 'true');

// Ver sessões armazenadas
console.log(localStorage.getItem('interviewSessions'));
```

---

**Nota**: Esta funcionalidade representa um diferencial competitivo significativo, oferecendo aos usuários uma ferramenta única para preparação profissional com feedback personalizado baseado em IA.
