import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ImproveResumeDto, ImprovementType } from './dto/improve-resume.dto';

interface AIImprovement {
  category: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

interface AIImproveResponse {
  improvedContent: string;
  improvements: AIImprovement[];
  score: {
    original: number;
    improved: number;
  };
}

interface ATSAnalysis {
  score: number;
  suggestions: string[];
  keywords: string[];
  missingKeywords: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string;
  private readonly openaiBaseUrl = 'https://api.openai.com/v1';

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async improveResume(improveResumeDto: ImproveResumeDto): Promise<AIImproveResponse> {
    try {
      const prompt = this.buildResumeImprovementPrompt(improveResumeDto);
      
      if (this.openaiApiKey) {
        const response = await this.callOpenAI(prompt);
        const aiResponse = JSON.parse(response);
        
        return {
          improvedContent: aiResponse.improvedContent,
          improvements: aiResponse.improvements || [],
          score: {
            original: this.calculateResumeScore(improveResumeDto.currentContent),
            improved: this.calculateResumeScore(aiResponse.improvedContent),
          },
        };
      } else {
        // Fallback para melhoria simulada se a IA não estiver configurada
        this.logger.warn('OpenAI API key not configured, using fallback improvement');
        return this.generateFallbackImprovement(improveResumeDto);
      }
    } catch (error) {
      this.logger.error('Error in AI service:', error);
      
      // Fallback para melhoria simulada se a IA falhar
      return this.generateFallbackImprovement(improveResumeDto);
    }
  }

  private buildResumeImprovementPrompt(dto: ImproveResumeDto): string {
    const { currentContent, userProfile, improvementType } = dto;

    const basePrompt = `
Você é um especialista em recursos humanos e redação de currículos. Sua tarefa é melhorar o currículo fornecido.

PERFIL DO USUÁRIO:
- Nome: ${userProfile.fullName}
- Cargo: ${userProfile.title}
- Experiência: ${userProfile.experience} anos
- Localização: ${userProfile.location}
- Habilidades: ${userProfile.skills?.join(', ') || 'Não informado'}
- Bio: ${userProfile.bio}

CURRÍCULO ATUAL:
${currentContent}

TIPO DE MELHORIA: ${improvementType}

INSTRUÇÕES:
1. Mantenha todas as informações factuais corretas
2. Melhore a linguagem para ser mais profissional e impactante
3. Otimize para ATS (Applicant Tracking Systems)
4. Adicione palavras-chave relevantes para a área
5. Melhore a estrutura e formatação
6. Destaque conquistas e resultados quantificáveis

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "improvedContent": "conteúdo melhorado em markdown",
  "improvements": [
    {
      "category": "categoria da melhoria",
      "description": "descrição da melhoria",
      "impact": "low|medium|high"
    }
  ]
}`;

    return basePrompt;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await axios.post(
      `${this.openaiBaseUrl}/chat/completions`,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recursos humanos e redação de currículos profissionais.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  }

  private generateFallbackImprovement(dto: ImproveResumeDto): AIImproveResponse {
    const improvedContent = this.applyBasicImprovements(dto.currentContent, dto.userProfile);

    return {
      improvedContent,
      improvements: [
        {
          category: 'Linguagem',
          description: 'Linguagem mais profissional e impactante',
          impact: 'high',
        },
        {
          category: 'Estrutura',
          description: 'Melhor organização das seções',
          impact: 'medium',
        },
        {
          category: 'Palavras-chave',
          description: 'Adição de palavras-chave relevantes',
          impact: 'high',
        },
        {
          category: 'Formatação',
          description: 'Formatação otimizada para ATS',
          impact: 'medium',
        },
      ],
      score: {
        original: this.calculateResumeScore(dto.currentContent),
        improved: this.calculateResumeScore(improvedContent),
      },
    };
  }

  private applyBasicImprovements(content: string, userProfile: any): string {
    let improved = content;

    // Melhorar título profissional
    if (userProfile.title) {
      improved = improved.replace(
        new RegExp(`\\*\\*${userProfile.title}\\*\\*`, 'g'),
        `**${userProfile.title} | Especialista em Desenvolvimento**`,
      );
    }

    // Adicionar LinkedIn se não existir
    if (!improved.includes('linkedin.com') && userProfile.fullName) {
      const linkedinUrl = `linkedin.com/in/${userProfile.fullName.toLowerCase().replace(' ', '-')}`;
      improved = improved.replace(
        /## Contato/,
        `## Contato\n- LinkedIn: ${linkedinUrl}`,
      );
    }

    // Melhorar resumo profissional
    if (userProfile.bio) {
      const enhancedBio = `${userProfile.bio} Profissional altamente qualificado com expertise comprovada em desenvolvimento de soluções escaláveis e inovadoras. Demonstra liderança técnica e capacidade de trabalhar em equipes multidisciplinares.`;
      improved = improved.replace(userProfile.bio, enhancedBio);
    }

    // Adicionar seção de diferenciais competitivos
    if (!improved.includes('Diferenciais Competitivos')) {
      improved += `\n\n## Diferenciais Competitivos
- Experiência em metodologias ágeis (Scrum/Kanban)
- Conhecimento avançado em DevOps e CI/CD
- Capacidade de mentoria e desenvolvimento de equipes
- Foco em qualidade de código e boas práticas`;
    }

    // Melhorar formatação de habilidades
    if (userProfile.skills && userProfile.skills.length > 0) {
      const skillsSection = userProfile.skills.join(' • ');
      improved = improved.replace(
        userProfile.skills.join(', '),
        skillsSection,
      );
    }

    return improved;
  }

  private calculateResumeScore(content: string): number {
    let score = 0;

    // Verificar presença de seções importantes
    const sections = ['Contato', 'Resumo', 'Experiência', 'Habilidades'];
    sections.forEach((section) => {
      if (content.includes(section)) score += 20;
    });

    // Verificar comprimento adequado
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) score += 10;

    // Verificar formatação markdown
    if (content.includes('##') && content.includes('**')) score += 10;

    return Math.min(score, 100);
  }

  async analyzeForATS(content: string): Promise<ATSAnalysis> {
    try {
      if (this.openaiApiKey) {
        const prompt = `
Analise o seguinte currículo para compatibilidade com ATS (Applicant Tracking Systems):

${content}

Retorne um JSON com:
{
  "score": número de 0-100,
  "suggestions": ["sugestão 1", "sugestão 2"],
  "keywords": ["palavra-chave encontrada"],
  "missingKeywords": ["palavra-chave importante ausente"]
}`;

        const response = await this.callOpenAI(prompt);
        return JSON.parse(response);
      } else {
        // Fallback para análise básica
        return this.basicATSAnalysis(content);
      }
    } catch (error) {
      this.logger.error('Error in ATS analysis:', error);
      
      // Fallback para análise básica
      return this.basicATSAnalysis(content);
    }
  }

  private basicATSAnalysis(content: string): ATSAnalysis {
    const keywords = this.extractKeywords(content);
    const score = this.calculateATSScore(content);

    return {
      score,
      suggestions: [
        'Use palavras-chave específicas da sua área',
        'Evite imagens e gráficos complexos',
        'Use formatação simples e clara',
        'Inclua seções padrão como Experiência e Educação',
      ],
      keywords,
      missingKeywords: [
        'liderança',
        'resultados',
        'projetos',
        'certificações',
      ],
    };
  }

  private extractKeywords(content: string): string[] {
    const commonKeywords = [
      'desenvolvedor', 'programador', 'software', 'web', 'mobile',
      'javascript', 'python', 'java', 'react', 'node', 'angular',
      'experiência', 'projeto', 'equipe', 'liderança', 'gestão',
    ];

    return commonKeywords.filter((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private calculateATSScore(content: string): number {
    let score = 0;

    // Verificar estrutura básica
    if (content.includes('##')) score += 20;
    if (content.includes('Experiência')) score += 20;
    if (content.includes('Educação') || content.includes('Formação')) score += 15;
    if (content.includes('Habilidades')) score += 15;
    if (content.includes('Contato')) score += 10;

    // Verificar palavras-chave
    const keywords = this.extractKeywords(content);
    score += Math.min(keywords.length * 2, 20);

    return Math.min(score, 100);
  }
}
