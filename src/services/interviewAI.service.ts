import { useAuthStore } from '../store/auth';

export interface InterviewMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface InterviewSession {
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

export interface InterviewScore {
  overall: number; // 0-100
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
}

class InterviewAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // Em produção, isso viria de variáveis de ambiente
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || null;
  }

  async startInterviewSession(
    type: InterviewSession['type'],
    position: string,
    company: string,
    difficulty: InterviewSession['difficulty'],
    profile?: any
  ): Promise<InterviewSession> {
    // Se o perfil não for passado, tenta obter do store
    if (!profile) {
      profile = useAuthStore.getState().profile;
    }

    const session: InterviewSession = {
      id: `interview_${Date.now()}`,
      type,
      position,
      company,
      difficulty,
      messages: [],
      startTime: new Date()
    };

    // Criar prompt inicial baseado no currículo do usuário
    const initialPrompt = this.buildInitialPrompt(profile, type, position, company, difficulty);

    try {
      const response = await this.callOpenAI([
        {
          role: 'system',
          content: initialPrompt
        }
      ]);

      const welcomeMessage: InterviewMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      session.messages.push(welcomeMessage);

      // Salvar sessão no localStorage
      this.saveSession(session);

      return session;
    } catch (error) {
      console.error('Erro ao iniciar sessão de entrevista:', error);

      // Fallback sem IA
      const fallbackMessage: InterviewMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: this.getFallbackWelcomeMessage(type, position, company),
        timestamp: new Date()
      };

      session.messages.push(fallbackMessage);
      this.saveSession(session);

      return session;
    }
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<InterviewMessage> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Adicionar mensagem do usuário
    const userMsg: InterviewMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    session.messages.push(userMsg);

    try {
      // Preparar contexto para a IA
      const messages = session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      const response = await this.callOpenAI(messages);

      const assistantMsg: InterviewMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      session.messages.push(assistantMsg);
      this.saveSession(session);

      return assistantMsg;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      // Fallback sem IA
      const fallbackResponse = this.getFallbackResponse(userMessage, session.type);
      const assistantMsg: InterviewMessage = {
        id: `msg_${Date.now()}_fallback`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      session.messages.push(assistantMsg);
      this.saveSession(session);

      return assistantMsg;
    }
  }

  async endInterviewSession(sessionId: string): Promise<InterviewScore> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    session.endTime = new Date();

    try {
      // Gerar pontuação com IA
      const score = await this.generateScore(session);
      session.score = score;
      this.saveSession(session);

      return score;
    } catch (error) {
      console.error('Erro ao gerar pontuação:', error);

      // Fallback para pontuação básica
      const fallbackScore = this.generateFallbackScore(session);
      session.score = fallbackScore;
      this.saveSession(session);

      return fallbackScore;
    }
  }

  private buildInitialPrompt(
    profile: any,
    type: string,
    position: string,
    company: string,
    difficulty: string
  ): string {
    return `Você é um entrevistador experiente conduzindo uma entrevista ${type} para a posição de ${position} na empresa ${company}.

PERFIL DO CANDIDATO:
- Nome: ${profile.fullName}
- Cargo atual: ${profile.title}
- Experiência: ${profile.experience} anos
- Localização: ${profile.location}
- Bio: ${profile.bio}
- Habilidades: ${profile.skills?.join(', ') || 'Não informado'}
- Expectativa salarial: ${profile.salaryExpectation?.min && profile.salaryExpectation?.max
  ? `R$ ${profile.salaryExpectation.min}k - ${profile.salaryExpectation.max}k`
  : 'Não informado'}

INSTRUÇÕES:
1. Conduza uma entrevista realista e profissional
2. Faça perguntas relevantes para o nível ${difficulty}
3. Seja encorajador mas desafiador
4. Adapte as perguntas baseado nas respostas
5. Mantenha um tom profissional mas amigável
6. Ao final, forneça feedback construtivo

Comece a entrevista se apresentando e fazendo a primeira pergunta.`;
  }

  private async callOpenAI(messages: Array<{role: string, content: string}>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key não configurada');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateScore(session: InterviewSession): Promise<InterviewScore> {
    const conversation = session.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const prompt = `Analise esta entrevista e forneça uma pontuação detalhada:

${conversation}

Retorne um JSON com:
{
  "overall": número de 0-100,
  "technical": número de 0-100,
  "communication": número de 0-100,
  "problemSolving": número de 0-100,
  "confidence": número de 0-100,
  "feedback": ["feedback 1", "feedback 2"],
  "strengths": ["força 1", "força 2"],
  "improvements": ["melhoria 1", "melhoria 2"]
}`;

    const response = await this.callOpenAI([
      {
        role: 'system',
        content: 'Você é um especialista em avaliação de entrevistas. Seja justo e construtivo.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return JSON.parse(response);
  }

  private getFallbackWelcomeMessage(type: string, position: string, company: string): string {
    return `Olá! Sou seu entrevistador virtual para a posição de ${position} na ${company}.

Esta é uma entrevista ${type} simulada para ajudá-lo a se preparar. Vou fazer algumas perguntas relevantes para a posição e ao final fornecerei feedback sobre seu desempenho.

Vamos começar! Pode se apresentar brevemente e me contar por que está interessado nesta posição?`;
  }

  private getFallbackResponse(userMessage: string, type: string): string {
    const responses = {
      technical: [
        "Interessante abordagem! Pode me explicar como você implementaria isso na prática?",
        "Boa resposta! Agora me conte sobre algum desafio técnico que você enfrentou recentemente.",
        "Entendo. Como você garantiria a performance dessa solução em escala?"
      ],
      behavioral: [
        "Muito bem! Pode me dar um exemplo específico de quando isso aconteceu?",
        "Interessante situação. Como você lidou com o feedback da equipe?",
        "Boa reflexão! Como você aplicaria essa experiência em nossa empresa?"
      ],
      general: [
        "Entendo seu ponto de vista. Pode elaborar mais sobre isso?",
        "Interessante! Como você vê isso se relacionando com nossos objetivos?",
        "Boa resposta! Tem alguma pergunta sobre a empresa ou a posição?"
      ]
    };

    const typeResponses = responses[type as keyof typeof responses] || responses.general;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  }

  private generateFallbackScore(session: InterviewSession): InterviewScore {
    const messageCount = session.messages.filter(msg => msg.role === 'user').length;
    const duration = session.endTime && session.startTime
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60
      : 10;

    // Pontuação baseada em participação e duração
    const baseScore = Math.min(85, 60 + (messageCount * 5) + (duration * 2));

    return {
      overall: Math.round(baseScore),
      technical: Math.round(baseScore + Math.random() * 10 - 5),
      communication: Math.round(baseScore + Math.random() * 10 - 5),
      problemSolving: Math.round(baseScore + Math.random() * 10 - 5),
      confidence: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: [
        "Demonstrou boa comunicação durante a entrevista",
        "Respondeu às perguntas de forma clara e objetiva",
        "Mostrou interesse genuíno na posição"
      ],
      strengths: [
        "Comunicação clara",
        "Experiência relevante",
        "Atitude positiva"
      ],
      improvements: [
        "Pode elaborar mais nas respostas técnicas",
        "Fazer mais perguntas sobre a empresa",
        "Demonstrar mais exemplos práticos"
      ]
    };
  }

  private saveSession(session: InterviewSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem('interviewSessions', JSON.stringify(sessions));
  }

  private getSession(sessionId: string): InterviewSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  private getSessions(): InterviewSession[] {
    const stored = localStorage.getItem('interviewSessions');
    return stored ? JSON.parse(stored) : [];
  }

  getRecentSessions(): InterviewSession[] {
    return this.getSessions()
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10);
  }
}

export const interviewAIService = new InterviewAIService();
