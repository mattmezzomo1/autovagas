import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion, SuggestionType } from './entities/suggestion.entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectRepository(Suggestion)
    private suggestionsRepository: Repository<Suggestion>,
    private aiService: AiService,
    private usersService: UsersService,
  ) {}

  async create(createSuggestionDto: CreateSuggestionDto): Promise<Suggestion> {
    const suggestion = this.suggestionsRepository.create(createSuggestionDto);
    return this.suggestionsRepository.save(suggestion);
  }

  async findAll(userId?: string): Promise<Suggestion[]> {
    // If userId is provided, return personalized suggestions for the user
    // Otherwise, return featured suggestions
    if (userId) {
      return this.suggestionsRepository.find({
        where: [
          { userId },
          { isFeatured: true },
        ],
        order: {
          relevance: 'DESC',
          createdAt: 'DESC',
        },
      });
    } else {
      return this.suggestionsRepository.find({
        where: { isFeatured: true },
        order: {
          relevance: 'DESC',
          createdAt: 'DESC',
        },
      });
    }
  }

  async findByType(type: SuggestionType, userId?: string): Promise<Suggestion[]> {
    // If userId is provided, return personalized suggestions for the user
    // Otherwise, return featured suggestions
    if (userId) {
      return this.suggestionsRepository.find({
        where: [
          { type, userId },
          { type, isFeatured: true },
        ],
        order: {
          relevance: 'DESC',
          createdAt: 'DESC',
        },
      });
    } else {
      return this.suggestionsRepository.find({
        where: { type, isFeatured: true },
        order: {
          relevance: 'DESC',
          createdAt: 'DESC',
        },
      });
    }
  }

  async findOne(id: string): Promise<Suggestion> {
    return this.suggestionsRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateSuggestionDto: UpdateSuggestionDto): Promise<Suggestion> {
    await this.suggestionsRepository.update(id, updateSuggestionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.suggestionsRepository.delete(id);
  }

  async analyzeResume(userId: string, analyzeResumeDto: AnalyzeResumeDto): Promise<any> {
    // Get user
    const user = await this.usersService.findById(userId);
    
    // Check if user has enough credits
    if (user.credits < 1) {
      throw new Error('Not enough credits');
    }
    
    // Analyze resume using AI
    const analysis = await this.aiService.analyzeResume(analyzeResumeDto.resumeText);
    
    // Generate personalized suggestions based on analysis
    const suggestions = await this.generatePersonalizedSuggestions(userId, analysis);
    
    // Deduct credits
    await this.usersService.updateCredits(userId, user.credits - 1);
    
    return {
      analysis,
      suggestions,
    };
  }

  private async generatePersonalizedSuggestions(userId: string, analysis: any): Promise<Suggestion[]> {
    // Delete existing personalized suggestions for the user
    await this.suggestionsRepository.delete({
      userId,
      isPersonalized: true,
    });
    
    // Generate new personalized suggestions based on analysis
    const suggestions: Suggestion[] = [];
    
    // Suggest courses based on weaknesses
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      for (const weakness of analysis.weaknesses) {
        const suggestion = this.suggestionsRepository.create({
          title: `Curso de ${weakness}`,
          description: `Melhore suas habilidades em ${weakness} com este curso completo.`,
          type: SuggestionType.COURSE,
          provider: 'Udemy',
          originalPrice: 199.99,
          discountPrice: 29.99,
          discountPercentage: 85,
          relevance: 5,
          duration: '20 horas',
          link: `https://www.udemy.com/course/${weakness.toLowerCase().replace(/\s+/g, '-')}`,
          image: `https://example.com/images/${weakness.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          tags: [weakness, 'Curso', 'Online'],
          isFeatured: false,
          isPersonalized: true,
          userId,
        });
        
        suggestions.push(await this.suggestionsRepository.save(suggestion));
      }
    }
    
    // Suggest books
    if (analysis.skills && analysis.skills.length > 0) {
      const skill = analysis.skills[Math.floor(Math.random() * analysis.skills.length)];
      
      const suggestion = this.suggestionsRepository.create({
        title: `Livro: Dominando ${skill}`,
        description: `Aprofunde seus conhecimentos em ${skill} com este livro completo.`,
        type: SuggestionType.BOOK,
        provider: 'Amazon',
        originalPrice: 89.99,
        discountPrice: 59.99,
        discountPercentage: 33,
        relevance: 4,
        link: `https://www.amazon.com.br/livro-${skill.toLowerCase().replace(/\s+/g, '-')}`,
        image: `https://example.com/images/book-${skill.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        tags: [skill, 'Livro', 'Especialização'],
        isFeatured: false,
        isPersonalized: true,
        userId,
      });
      
      suggestions.push(await this.suggestionsRepository.save(suggestion));
    }
    
    // Suggest certifications
    if (analysis.skills && analysis.skills.length > 0) {
      const skill = analysis.skills[Math.floor(Math.random() * analysis.skills.length)];
      
      const suggestion = this.suggestionsRepository.create({
        title: `Certificação ${skill}`,
        description: `Obtenha uma certificação reconhecida em ${skill} e destaque-se no mercado.`,
        type: SuggestionType.CERTIFICATION,
        provider: 'Coursera',
        originalPrice: 299.99,
        discountPrice: 199.99,
        discountPercentage: 33,
        relevance: 5,
        duration: '3 meses',
        link: `https://www.coursera.org/certification/${skill.toLowerCase().replace(/\s+/g, '-')}`,
        image: `https://example.com/images/cert-${skill.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        tags: [skill, 'Certificação', 'Profissional'],
        isFeatured: false,
        isPersonalized: true,
        userId,
      });
      
      suggestions.push(await this.suggestionsRepository.save(suggestion));
    }
    
    return suggestions;
  }
}
