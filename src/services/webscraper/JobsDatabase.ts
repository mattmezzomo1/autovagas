import { ApplicationResult, ScrapedJob } from './types';

/**
 * Classe para gerenciar o banco de dados de vagas
 * 
 * Esta classe fornece métodos para armazenar, recuperar e gerenciar vagas
 * encontradas pelos scrapers. Em uma implementação real, isso se conectaria
 * a um banco de dados real como MongoDB, PostgreSQL, etc.
 */
export class JobsDatabase {
  private jobs: Map<string, ScrapedJob> = new Map();
  private applications: Map<string, ApplicationResult> = new Map();
  private categories: Map<string, Set<string>> = new Map();
  
  constructor() {
    // Inicializa as categorias padrão
    this.categories.set('tech', new Set());
    this.categories.set('marketing', new Set());
    this.categories.set('sales', new Set());
    this.categories.set('finance', new Set());
    this.categories.set('hr', new Set());
    this.categories.set('design', new Set());
    this.categories.set('other', new Set());
  }
  
  /**
   * Adiciona uma vaga ao banco de dados
   */
  addJob(job: ScrapedJob): void {
    this.jobs.set(job.id, job);
    
    // Categoriza a vaga
    const category = this.categorizeJob(job);
    const categorySet = this.categories.get(category);
    if (categorySet) {
      categorySet.add(job.id);
    }
    
    console.log(`Vaga adicionada ao banco de dados: ${job.title} (${job.id})`);
  }
  
  /**
   * Adiciona múltiplas vagas ao banco de dados
   */
  addJobs(jobs: ScrapedJob[]): void {
    for (const job of jobs) {
      this.addJob(job);
    }
    
    console.log(`${jobs.length} vagas adicionadas ao banco de dados`);
  }
  
  /**
   * Obtém uma vaga pelo ID
   */
  getJob(id: string): ScrapedJob | undefined {
    return this.jobs.get(id);
  }
  
  /**
   * Obtém todas as vagas
   */
  getAllJobs(): ScrapedJob[] {
    return Array.from(this.jobs.values());
  }
  
  /**
   * Obtém vagas por categoria
   */
  getJobsByCategory(category: string): ScrapedJob[] {
    const categorySet = this.categories.get(category);
    if (!categorySet) {
      return [];
    }
    
    return Array.from(categorySet)
      .map(id => this.jobs.get(id))
      .filter((job): job is ScrapedJob => job !== undefined);
  }
  
  /**
   * Adiciona uma aplicação ao banco de dados
   */
  addApplication(application: ApplicationResult): void {
    this.applications.set(application.id, application);
    console.log(`Aplicação adicionada ao banco de dados: ${application.id}`);
  }
  
  /**
   * Obtém uma aplicação pelo ID
   */
  getApplication(id: string): ApplicationResult | undefined {
    return this.applications.get(id);
  }
  
  /**
   * Obtém todas as aplicações
   */
  getAllApplications(): ApplicationResult[] {
    return Array.from(this.applications.values());
  }
  
  /**
   * Atualiza o status de uma aplicação
   */
  updateApplicationStatus(id: string, status: 'success' | 'failed' | 'pending'): boolean {
    const application = this.applications.get(id);
    if (!application) {
      return false;
    }
    
    application.status = status;
    this.applications.set(id, application);
    console.log(`Status da aplicação ${id} atualizado para: ${status}`);
    return true;
  }
  
  /**
   * Busca vagas por palavras-chave
   */
  searchJobs(query: string): ScrapedJob[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.jobs.values()).filter(job => {
      return (
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.description?.toLowerCase().includes(lowerQuery) ||
        job.requirements.some(req => req.toLowerCase().includes(lowerQuery))
      );
    });
  }
  
  /**
   * Categoriza uma vaga com base em seu título e descrição
   */
  private categorizeJob(job: ScrapedJob): string {
    const text = `${job.title} ${job.description || ''} ${job.requirements.join(' ')}`.toLowerCase();
    
    // Palavras-chave para categorização
    const categoryKeywords: Record<string, string[]> = {
      tech: ['desenvolvedor', 'programador', 'software', 'developer', 'engineer', 'engenheiro', 'frontend', 'backend', 'fullstack', 'devops', 'data', 'dados', 'python', 'java', 'javascript', 'react', 'angular', 'node', 'aws', 'cloud', 'database', 'banco de dados', 'sql', 'nosql', 'api', 'sistemas', 'ti', 'tecnologia'],
      marketing: ['marketing', 'digital', 'social media', 'mídia', 'conteúdo', 'seo', 'sem', 'growth', 'aquisição', 'campanha', 'brand', 'marca', 'performance', 'tráfego', 'funil', 'crm'],
      sales: ['vendas', 'sales', 'comercial', 'account', 'cliente', 'customer', 'negociação', 'inside sales', 'sdr', 'bdr', 'hunter', 'closer', 'pré-vendas', 'presales'],
      finance: ['financeiro', 'finance', 'contabilidade', 'accounting', 'contador', 'fiscal', 'tributário', 'controladoria', 'controller', 'tesouraria', 'treasury', 'auditoria', 'audit'],
      hr: ['rh', 'recursos humanos', 'human resources', 'recrutamento', 'recruitment', 'seleção', 'talent', 'talento', 'people', 'pessoas', 'cultura', 'culture', 'treinamento', 'training', 'desenvolvimento', 'development'],
      design: ['design', 'ux', 'ui', 'user experience', 'user interface', 'produto', 'product', 'gráfico', 'graphic', 'web design', 'motion', 'ilustração', 'illustration']
    };
    
    // Verifica cada categoria
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    // Categoria padrão
    return 'other';
  }
  
  /**
   * Limpa o banco de dados
   */
  clear(): void {
    this.jobs.clear();
    this.applications.clear();
    
    // Limpa as categorias
    for (const categorySet of this.categories.values()) {
      categorySet.clear();
    }
    
    console.log('Banco de dados limpo');
  }
  
  /**
   * Obtém estatísticas do banco de dados
   */
  getStats(): Record<string, any> {
    const categoryStats: Record<string, number> = {};
    
    for (const [category, jobIds] of this.categories.entries()) {
      categoryStats[category] = jobIds.size;
    }
    
    return {
      totalJobs: this.jobs.size,
      totalApplications: this.applications.size,
      categories: categoryStats,
      platforms: this.getPlatformStats()
    };
  }
  
  /**
   * Obtém estatísticas por plataforma
   */
  private getPlatformStats(): Record<string, number> {
    const stats: Record<string, number> = {
      linkedin: 0,
      infojobs: 0,
      catho: 0,
      indeed: 0
    };
    
    for (const job of this.jobs.values()) {
      if (job.platform in stats) {
        stats[job.platform]++;
      }
    }
    
    return stats;
  }
}

// Exporta uma instância singleton do banco de dados
export const jobsDatabase = new JobsDatabase();
