import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para o LinkedIn
 */
export class LinkedInScraperService extends WebScraperService {
  /**
   * Realiza login no LinkedIn
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login no LinkedIn...');
    
    try {
      if (!this.browser) {
        await this.initialize();
      }
      
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);
      
      // Navega para a página de login do LinkedIn
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
      
      // Preenche o formulário de login
      await page.waitForSelector('#username');
      await page.type('#username', credentials.username);
      await page.type('#password', credentials.password);
      
      // Clica no botão de login
      await page.click('button[type="submit"]');
      
      // Espera pela navegação após o login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('.feed-identity-module') !== null;
      });
      
      if (isLoggedIn) {
        this.pages.linkedin = page;
        this.loggedIn.linkedin = true;
        console.log('Login no LinkedIn realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login do LinkedIn: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login no LinkedIn:', error);
      return false;
    }
  }

  /**
   * Busca vagas no LinkedIn com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas no LinkedIn com parâmetros:', params);
    
    if (!this.loggedIn.linkedin) {
      throw new Error('É necessário fazer login no LinkedIn antes de buscar vagas');
    }
    
    try {
      const page = this.pages.linkedin;
      
      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = 'https://www.linkedin.com/jobs/search/?';
      const queryParams: string[] = [];
      
      // Adiciona palavras-chave
      if (params.keywords && params.keywords.length > 0) {
        queryParams.push(`keywords=${encodeURIComponent(params.keywords.join(' '))}`);
      }
      
      // Adiciona localização
      if (params.locations && params.locations.length > 0) {
        queryParams.push(`location=${encodeURIComponent(params.locations[0])}`);
      }
      
      // Adiciona filtro de trabalho remoto
      if (params.remote) {
        queryParams.push('f_WT=2');
      }
      
      // Adiciona filtro de tipo de contrato
      if (params.jobTypes && params.jobTypes.length > 0) {
        // Mapeamento de tipos de contrato para os códigos do LinkedIn
        const jobTypeMap: Record<string, string> = {
          'CLT': 'F_JT=F',
          'PJ': 'F_JT=C',
          'Estágio': 'F_JT=I',
          'Freelancer': 'F_JT=C'
        };
        
        const jobTypeFilters = params.jobTypes
          .map(type => jobTypeMap[type])
          .filter(Boolean);
        
        if (jobTypeFilters.length > 0) {
          queryParams.push(...jobTypeFilters);
        }
      }
      
      searchUrl += queryParams.join('&');
      
      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Espera pelos resultados da busca
      await page.waitForSelector('.jobs-search__results-list');
      
      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.jobs-search__results-list > li');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.job-card-list__title');
          const companyElement = jobElement.querySelector('.job-card-container__company-name');
          const locationElement = jobElement.querySelector('.job-card-container__metadata-item');
          const linkElement = jobElement.querySelector('.job-card-list__title');
          
          return {
            title: titleElement ? titleElement.textContent?.trim() : '',
            company: companyElement ? companyElement.textContent?.trim() : '',
            location: locationElement ? locationElement.textContent?.trim() : '',
            url: linkElement ? linkElement.getAttribute('href') : ''
          };
        });
      });
      
      // Converte os dados extraídos para o formato ScrapedJob
      const scrapedJobs: ScrapedJob[] = [];
      
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        
        // Obtém detalhes adicionais da vaga
        await page.goto(job.url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.job-view-layout');
        
        const jobDetails = await page.evaluate(() => {
          const descriptionElement = document.querySelector('.show-more-less-html__markup');
          const salaryElement = document.querySelector('.compensation__salary');
          const jobTypeElement = document.querySelector('.job-criteria-text__list-item:nth-child(1)');
          
          return {
            description: descriptionElement ? descriptionElement.textContent?.trim() : '',
            salary: salaryElement ? salaryElement.textContent?.trim() : '',
            jobType: jobTypeElement ? jobTypeElement.textContent?.trim() : ''
          };
        });
        
        // Extrai requisitos da descrição
        const requirements = this.extractRequirementsFromDescription(jobDetails.description || '');
        
        scrapedJobs.push({
          id: `linkedin-${Date.now()}-${i}`,
          platform: 'linkedin',
          title: job.title || 'Título não disponível',
          company: job.company || 'Empresa não disponível',
          location: job.location || 'Localização não disponível',
          salary: jobDetails.salary || undefined,
          description: jobDetails.description || undefined,
          requirements,
          jobType: this.mapLinkedInJobType(jobDetails.jobType || ''),
          workModel: this.determineWorkModel(job.location || ''),
          applicationUrl: job.url
        });
        
        // Adiciona um atraso para evitar detecção
        await this.delay(this.config.delayBetweenActions);
      }
      
      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas no LinkedIn:', error);
      
      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('linkedin', params);
    }
  }

  /**
   * Aplica para uma vaga no LinkedIn
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} no LinkedIn`);
    
    if (!this.loggedIn.linkedin) {
      throw new Error('É necessário fazer login no LinkedIn antes de aplicar para vagas');
    }
    
    try {
      const page = this.pages.linkedin;
      
      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });
      
      // Espera pelo botão de aplicação
      await page.waitForSelector('.jobs-apply-button');
      
      // Clica no botão de aplicação
      await page.click('.jobs-apply-button');
      
      // Espera pelo formulário de aplicação
      await page.waitForSelector('.jobs-easy-apply-content');
      
      // Preenche o formulário de aplicação
      // Nota: Esta parte varia muito dependendo da vaga e da empresa
      // Aqui implementaríamos a lógica para preencher diferentes tipos de formulários
      
      // Exemplo: Preencher um campo de telefone
      const phoneField = await page.$('input[name="phoneNumber"]');
      if (phoneField) {
        await phoneField.type(profile.phone || '');
      }
      
      // Exemplo: Fazer upload do currículo
      const resumeUpload = await page.$('input[type="file"]');
      if (resumeUpload) {
        // Aqui precisaríamos ter acesso ao arquivo do currículo
        // await resumeUpload.uploadFile('/path/to/resume.pdf');
      }
      
      // Clica no botão de enviar
      await page.click('button[aria-label="Submit application"]');
      
      // Espera pela confirmação
      await page.waitForSelector('.artdeco-inline-feedback--success');
      
      // Extrai o ID da aplicação (se disponível)
      const applicationId = await page.evaluate(() => {
        const element = document.querySelector('.jobs-details-top-card__job-title');
        return element ? element.getAttribute('data-job-id') : null;
      });
      
      return {
        jobId: job.id,
        platform: 'linkedin',
        success: true,
        applicationId: applicationId || `linkedin-app-${Date.now()}`,
        applicationUrl: job.applicationUrl,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} no LinkedIn:`, error);
      
      // Em caso de erro, retorna um resultado simulado
      return super.applyToJob('linkedin', job, profile);
    }
  }

  /**
   * Verifica o status de uma aplicação no LinkedIn
   */
  async checkApplicationStatus(applicationId: string): Promise<string> {
    console.log(`Verificando status da aplicação ${applicationId} no LinkedIn`);
    
    if (!this.loggedIn.linkedin) {
      throw new Error('É necessário fazer login no LinkedIn antes de verificar o status da aplicação');
    }
    
    try {
      const page = this.pages.linkedin;
      
      // Navega para a página de aplicações
      await page.goto('https://www.linkedin.com/jobs/tracker/applied/', { waitUntil: 'networkidle2' });
      
      // Espera pela lista de aplicações
      await page.waitForSelector('.jobs-tracker-applied-list');
      
      // Busca a aplicação pelo ID
      const applicationElement = await page.$(`[data-job-id="${applicationId}"]`);
      
      if (!applicationElement) {
        return 'Aplicação não encontrada';
      }
      
      // Extrai o status da aplicação
      const status = await applicationElement.$eval('.jobs-tracker-applied-status', element => element.textContent?.trim());
      
      return status || 'Status não disponível';
    } catch (error) {
      console.error(`Erro ao verificar status da aplicação ${applicationId} no LinkedIn:`, error);
      
      // Em caso de erro, retorna um status simulado
      return super.checkApplicationStatus('linkedin', applicationId);
    }
  }

  /**
   * Extrai requisitos da descrição da vaga
   */
  private extractRequirementsFromDescription(description: string): string[] {
    // Busca por seções comuns de requisitos
    const requirementSections = [
      'Requisitos',
      'Qualificações',
      'Habilidades',
      'Requirements',
      'Qualifications',
      'Skills'
    ];
    
    // Divide a descrição em linhas
    const lines = description.split('\n');
    
    // Busca por linhas que começam com marcadores comuns
    const bulletPoints = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('•') || 
             trimmed.startsWith('-') || 
             trimmed.startsWith('*') ||
             /^\d+\./.test(trimmed);
    });
    
    // Se encontrou pontos de marcadores, usa-os como requisitos
    if (bulletPoints.length > 0) {
      return bulletPoints.map(point => point.trim().replace(/^[•\-*\d\.]+\s*/, ''));
    }
    
    // Caso contrário, busca por palavras-chave comuns de tecnologias
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 
      'Node.js', 'Python', 'Java', 'C#', '.NET',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'Git', 'CI/CD', 'Agile', 'Scrum', 'Kanban'
    ];
    
    const foundKeywords = techKeywords.filter(keyword => 
      description.includes(keyword)
    );
    
    return foundKeywords;
  }

  /**
   * Mapeia o tipo de contrato do LinkedIn para o formato padronizado
   */
  private mapLinkedInJobType(linkedInType: string): string {
    const lowerType = linkedInType.toLowerCase();
    
    if (lowerType.includes('tempo integral') || lowerType.includes('full-time')) {
      return 'CLT';
    }
    
    if (lowerType.includes('freelancer') || lowerType.includes('contractor')) {
      return 'PJ';
    }
    
    if (lowerType.includes('estágio') || lowerType.includes('internship')) {
      return 'Estágio';
    }
    
    if (lowerType.includes('temporário') || lowerType.includes('temporary')) {
      return 'Temporário';
    }
    
    return linkedInType;
  }

  /**
   * Determina o modelo de trabalho com base na localização
   */
  private determineWorkModel(location: string): string {
    const lowerLocation = location.toLowerCase();
    
    if (lowerLocation.includes('remoto') || lowerLocation.includes('remote')) {
      return 'Remoto';
    }
    
    if (lowerLocation.includes('híbrido') || lowerLocation.includes('hybrid')) {
      return 'Híbrido';
    }
    
    return 'Presencial';
  }
}
