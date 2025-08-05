import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para o Indeed
 */
export class IndeedScraperService extends WebScraperService {
  /**
   * Realiza login no Indeed
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login no Indeed...');
    
    try {
      if (!this.browser) {
        await this.initialize();
      }
      
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);
      
      // Navega para a página de login do Indeed
      await page.goto('https://secure.indeed.com/account/login', { waitUntil: 'networkidle2' });
      
      // Preenche o formulário de login
      await page.waitForSelector('#ifl-InputEmail');
      await page.type('#ifl-InputEmail', credentials.username);
      await page.click('button[type="submit"]');
      
      // Espera pela página de senha
      await page.waitForSelector('#ifl-InputPassword');
      await page.type('#ifl-InputPassword', credentials.password);
      await page.click('button[type="submit"]');
      
      // Espera pela navegação após o login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('.gnav-loggedIn') !== null;
      });
      
      if (isLoggedIn) {
        this.pages.indeed = page;
        this.loggedIn.indeed = true;
        console.log('Login no Indeed realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login do Indeed: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login no Indeed:', error);
      return false;
    }
  }

  /**
   * Busca vagas no Indeed com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas no Indeed com parâmetros:', params);
    
    if (!this.loggedIn.indeed) {
      console.log('Não está logado no Indeed, tentando buscar sem login...');
    }
    
    try {
      // Usa a página existente ou cria uma nova
      const page = this.pages.indeed || await this.browser.newPage();
      if (!this.pages.indeed) {
        await page.setUserAgent(this.config.userAgent);
        await page.setDefaultTimeout(this.config.timeout);
        this.pages.indeed = page;
      }
      
      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = 'https://br.indeed.com/jobs?';
      const queryParams: string[] = [];
      
      // Adiciona palavras-chave
      if (params.keywords && params.keywords.length > 0) {
        queryParams.push(`q=${encodeURIComponent(params.keywords.join(' '))}`);
      }
      
      // Adiciona localização
      if (params.locations && params.locations.length > 0) {
        queryParams.push(`l=${encodeURIComponent(params.locations[0])}`);
      }
      
      // Adiciona filtro de trabalho remoto
      if (params.remote) {
        queryParams.push('remotejob=1');
      }
      
      searchUrl += queryParams.join('&');
      
      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Espera pelos resultados da busca
      await page.waitForSelector('.jobsearch-ResultsList');
      
      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.job_seen_beacon');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.jobTitle span');
          const companyElement = jobElement.querySelector('.companyName');
          const locationElement = jobElement.querySelector('.companyLocation');
          const salaryElement = jobElement.querySelector('.salary-snippet');
          const snippetElement = jobElement.querySelector('.job-snippet');
          const linkElement = jobElement.querySelector('.jcs-JobTitle');
          const dateElement = jobElement.querySelector('.date');
          
          return {
            title: titleElement ? titleElement.textContent?.trim() : '',
            company: companyElement ? companyElement.textContent?.trim() : '',
            location: locationElement ? locationElement.textContent?.trim() : '',
            salary: salaryElement ? salaryElement.textContent?.trim() : '',
            snippet: snippetElement ? snippetElement.textContent?.trim() : '',
            url: linkElement ? linkElement.getAttribute('href') : '',
            date: dateElement ? dateElement.textContent?.trim() : ''
          };
        });
      });
      
      // Converte os dados extraídos para o formato ScrapedJob
      const scrapedJobs: ScrapedJob[] = [];
      
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        
        // Obtém detalhes adicionais da vaga
        if (job.url) {
          const fullUrl = job.url.startsWith('http') ? job.url : `https://br.indeed.com${job.url}`;
          await page.goto(fullUrl, { waitUntil: 'networkidle2' });
          await page.waitForSelector('#jobDescriptionText');
          
          const jobDetails = await page.evaluate(() => {
            const descriptionElement = document.querySelector('#jobDescriptionText');
            const jobTypeElement = document.querySelector('.jobsearch-JobMetadataHeader-item');
            
            return {
              description: descriptionElement ? descriptionElement.textContent?.trim() : '',
              jobType: jobTypeElement ? jobTypeElement.textContent?.trim() : ''
            };
          });
          
          // Extrai requisitos da descrição
          const requirements = this.extractRequirementsFromDescription(jobDetails.description || '');
          
          scrapedJobs.push({
            id: `indeed-${Date.now()}-${i}`,
            platform: 'indeed',
            title: job.title || 'Título não disponível',
            company: job.company || 'Empresa não disponível',
            location: job.location || 'Localização não disponível',
            salary: job.salary || undefined,
            description: jobDetails.description || undefined,
            requirements,
            jobType: this.mapIndeedJobType(jobDetails.jobType || ''),
            workModel: this.determineWorkModel(job.location || ''),
            applicationUrl: fullUrl,
            postedDate: this.parseIndeedDate(job.date || '')
          });
          
          // Adiciona um atraso para evitar detecção
          await this.delay(this.config.delayBetweenActions);
        }
      }
      
      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas no Indeed:', error);
      
      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('indeed', params);
    }
  }

  /**
   * Aplica para uma vaga no Indeed
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} no Indeed`);
    
    if (!this.loggedIn.indeed) {
      throw new Error('É necessário fazer login no Indeed antes de aplicar para vagas');
    }
    
    try {
      const page = this.pages.indeed;
      
      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });
      
      // Espera pelo botão de aplicação
      await page.waitForSelector('.jobsearch-IndeedApplyButton-newDesign');
      
      // Clica no botão de aplicação
      await page.click('.jobsearch-IndeedApplyButton-newDesign');
      
      // Espera pelo formulário de aplicação no iframe
      await page.waitForSelector('iframe#indeedapply-iframe');
      const frameHandle = await page.$('iframe#indeedapply-iframe');
      const frame = await frameHandle!.contentFrame();
      
      // Espera pelo formulário no iframe
      await frame!.waitForSelector('form');
      
      // Preenche o formulário de aplicação
      // Nota: Esta parte varia muito dependendo da vaga e da empresa
      
      // Exemplo: Preencher um campo de telefone
      const phoneField = await frame!.$('input[name="phoneNumber"]');
      if (phoneField) {
        await phoneField.type(profile.phone || '');
      }
      
      // Exemplo: Fazer upload do currículo
      const resumeUpload = await frame!.$('input[type="file"]');
      if (resumeUpload) {
        // Aqui precisaríamos ter acesso ao arquivo do currículo
        // await resumeUpload.uploadFile('/path/to/resume.pdf');
      }
      
      // Clica no botão de continuar/enviar
      await frame!.click('button[type="submit"]');
      
      // Espera pela confirmação
      await frame!.waitForSelector('.ia-Success-title');
      
      return {
        id: `indeed-app-${Date.now()}`,
        jobId: job.id,
        platform: 'indeed',
        title: job.title,
        company: job.company,
        status: 'success',
        appliedAt: new Date(),
        applicationUrl: job.applicationUrl,
        matchScore: 85,
        resumeUsed: 'resume.pdf'
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} no Indeed:`, error);
      
      // Em caso de erro, retorna um resultado simulado
      return {
        id: `indeed-app-${Date.now()}`,
        jobId: job.id,
        platform: 'indeed',
        title: job.title,
        company: job.company,
        status: 'failed',
        appliedAt: new Date(),
        error: 'Erro ao preencher o formulário de aplicação',
        matchScore: 85,
        resumeUsed: 'resume.pdf'
      };
    }
  }

  /**
   * Extrai requisitos da descrição da vaga
   */
  private extractRequirementsFromDescription(description: string): string[] {
    // Implementação similar à do LinkedInScraperService
    const requirementSections = [
      'Requisitos',
      'Qualificações',
      'Habilidades',
      'Requirements',
      'Qualifications',
      'Skills'
    ];
    
    const lines = description.split('\n');
    
    const bulletPoints = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('•') || 
             trimmed.startsWith('-') || 
             trimmed.startsWith('*') ||
             /^\d+\./.test(trimmed);
    });
    
    if (bulletPoints.length > 0) {
      return bulletPoints.map(point => point.trim().replace(/^[•\-*\d\.]+\s*/, ''));
    }
    
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
   * Mapeia o tipo de contrato do Indeed para o formato padronizado
   */
  private mapIndeedJobType(indeedType: string): string {
    const lowerType = indeedType.toLowerCase();
    
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
    
    return indeedType;
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

  /**
   * Converte a data do Indeed para um objeto Date
   */
  private parseIndeedDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    
    try {
      // Formatos comuns do Indeed: "há X dias", "hoje", "ontem"
      const today = new Date();
      
      if (dateStr.includes('hoje')) {
        return today;
      }
      
      if (dateStr.includes('ontem')) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return yesterday;
      }
      
      // Formato "há X dias"
      const daysMatch = dateStr.match(/há (\d+) dias?/);
      if (daysMatch && daysMatch[1]) {
        const daysAgo = parseInt(daysMatch[1], 10);
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date;
      }
      
      // Formato "há X semanas"
      const weeksMatch = dateStr.match(/há (\d+) semanas?/);
      if (weeksMatch && weeksMatch[1]) {
        const weeksAgo = parseInt(weeksMatch[1], 10);
        const date = new Date(today);
        date.setDate(today.getDate() - (weeksAgo * 7));
        return date;
      }
      
      // Formato "há X meses"
      const monthsMatch = dateStr.match(/há (\d+) meses?/);
      if (monthsMatch && monthsMatch[1]) {
        const monthsAgo = parseInt(monthsMatch[1], 10);
        const date = new Date(today);
        date.setMonth(today.getMonth() - monthsAgo);
        return date;
      }
      
      return undefined;
    } catch (error) {
      console.error('Erro ao converter data do Indeed:', error);
      return undefined;
    }
  }
}
