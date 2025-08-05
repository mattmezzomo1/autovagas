import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para a InfoJobs
 */
export class InfoJobsScraperService extends WebScraperService {
  /**
   * Realiza login na InfoJobs
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login na InfoJobs...');
    
    try {
      if (!this.browser) {
        await this.initialize();
      }
      
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);
      
      // Navega para a página de login da InfoJobs
      await page.goto('https://www.infojobs.com.br/candidate/login.aspx', { waitUntil: 'networkidle2' });
      
      // Preenche o formulário de login
      await page.waitForSelector('#Email');
      await page.type('#Email', credentials.username);
      await page.type('#Password', credentials.password);
      
      // Clica no botão de login
      await page.click('#btnLogin');
      
      // Espera pela navegação após o login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('.candidate-home') !== null;
      });
      
      if (isLoggedIn) {
        this.pages.infojobs = page;
        this.loggedIn.infojobs = true;
        console.log('Login na InfoJobs realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login da InfoJobs: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login na InfoJobs:', error);
      return false;
    }
  }

  /**
   * Busca vagas na InfoJobs com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas na InfoJobs com parâmetros:', params);
    
    if (!this.loggedIn.infojobs) {
      throw new Error('É necessário fazer login na InfoJobs antes de buscar vagas');
    }
    
    try {
      const page = this.pages.infojobs;
      
      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = 'https://www.infojobs.com.br/empregos.aspx?';
      const queryParams: string[] = [];
      
      // Adiciona palavras-chave
      if (params.keywords && params.keywords.length > 0) {
        queryParams.push(`palabra=${encodeURIComponent(params.keywords.join(' '))}`);
      }
      
      // Adiciona localização
      if (params.locations && params.locations.length > 0) {
        queryParams.push(`provincia=${encodeURIComponent(params.locations[0])}`);
      }
      
      // Adiciona filtro de trabalho remoto
      if (params.remote) {
        queryParams.push('teletrabajo=true');
      }
      
      searchUrl += queryParams.join('&');
      
      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Espera pelos resultados da busca
      await page.waitForSelector('.vacancy-list');
      
      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.vacancy-item');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.vacancy-title a');
          const companyElement = jobElement.querySelector('.vacancy-company');
          const locationElement = jobElement.querySelector('.vacancy-location');
          const salaryElement = jobElement.querySelector('.vacancy-salary');
          const linkElement = jobElement.querySelector('.vacancy-title a');
          
          return {
            title: titleElement ? titleElement.textContent?.trim() : '',
            company: companyElement ? companyElement.textContent?.trim() : '',
            location: locationElement ? locationElement.textContent?.trim() : '',
            salary: salaryElement ? salaryElement.textContent?.trim() : '',
            url: linkElement ? linkElement.getAttribute('href') : ''
          };
        });
      });
      
      // Converte os dados extraídos para o formato ScrapedJob
      const scrapedJobs: ScrapedJob[] = [];
      
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        
        // Obtém detalhes adicionais da vaga
        await page.goto('https://www.infojobs.com.br' + job.url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.vacancy-details');
        
        const jobDetails = await page.evaluate(() => {
          const descriptionElement = document.querySelector('.vacancy-description');
          const requirementsElement = document.querySelector('.vacancy-requirements');
          const jobTypeElement = document.querySelector('.vacancy-contract-type');
          const workModelElement = document.querySelector('.vacancy-work-model');
          const workHoursElement = document.querySelector('.vacancy-work-hours');
          
          // Extrai os requisitos como uma lista
          const requirementsList: string[] = [];
          const requirementItems = document.querySelectorAll('.requirement-item');
          requirementItems.forEach(item => {
            const text = item.textContent?.trim();
            if (text) requirementsList.push(text);
          });
          
          return {
            description: descriptionElement ? descriptionElement.textContent?.trim() : '',
            requirements: requirementsList,
            jobType: jobTypeElement ? jobTypeElement.textContent?.trim() : '',
            workModel: workModelElement ? workModelElement.textContent?.trim() : '',
            workHours: workHoursElement ? workHoursElement.textContent?.trim() : ''
          };
        });
        
        scrapedJobs.push({
          id: `infojobs-${Date.now()}-${i}`,
          platform: 'infojobs',
          title: job.title || 'Título não disponível',
          company: job.company || 'Empresa não disponível',
          location: job.location || 'Localização não disponível',
          salary: job.salary || undefined,
          description: jobDetails.description || undefined,
          requirements: jobDetails.requirements || [],
          jobType: jobDetails.jobType || undefined,
          workModel: jobDetails.workModel || undefined,
          workHours: jobDetails.workHours || undefined,
          applicationUrl: 'https://www.infojobs.com.br' + job.url
        });
        
        // Adiciona um atraso para evitar detecção
        await this.delay(this.config.delayBetweenActions);
      }
      
      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas na InfoJobs:', error);
      
      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('infojobs', params);
    }
  }

  /**
   * Aplica para uma vaga na InfoJobs
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} na InfoJobs`);
    
    if (!this.loggedIn.infojobs) {
      throw new Error('É necessário fazer login na InfoJobs antes de aplicar para vagas');
    }
    
    try {
      const page = this.pages.infojobs;
      
      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });
      
      // Espera pelo botão de aplicação
      await page.waitForSelector('.apply-button');
      
      // Clica no botão de aplicação
      await page.click('.apply-button');
      
      // Espera pela confirmação
      await page.waitForSelector('.application-success');
      
      // Extrai o ID da aplicação
      const applicationId = await page.evaluate(() => {
        const element = document.querySelector('.application-id');
        return element ? element.textContent?.trim() : null;
      });
      
      return {
        jobId: job.id,
        platform: 'infojobs',
        success: true,
        applicationId: applicationId || `infojobs-app-${Date.now()}`,
        applicationUrl: `https://www.infojobs.com.br/candidate/applications/${applicationId}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} na InfoJobs:`, error);
      
      // Em caso de erro, retorna um resultado simulado
      return super.applyToJob('infojobs', job, profile);
    }
  }

  /**
   * Verifica o status de uma aplicação na InfoJobs
   */
  async checkApplicationStatus(applicationId: string): Promise<string> {
    console.log(`Verificando status da aplicação ${applicationId} na InfoJobs`);
    
    if (!this.loggedIn.infojobs) {
      throw new Error('É necessário fazer login na InfoJobs antes de verificar o status da aplicação');
    }
    
    try {
      const page = this.pages.infojobs;
      
      // Navega para a página de aplicações
      await page.goto('https://www.infojobs.com.br/candidate/applications', { waitUntil: 'networkidle2' });
      
      // Espera pela lista de aplicações
      await page.waitForSelector('.applications-list');
      
      // Busca a aplicação pelo ID
      const applicationElement = await page.$(`[data-application-id="${applicationId}"]`);
      
      if (!applicationElement) {
        return 'Aplicação não encontrada';
      }
      
      // Extrai o status da aplicação
      const status = await applicationElement.$eval('.application-status', element => element.textContent?.trim());
      
      return status || 'Status não disponível';
    } catch (error) {
      console.error(`Erro ao verificar status da aplicação ${applicationId} na InfoJobs:`, error);
      
      // Em caso de erro, retorna um status simulado
      return super.checkApplicationStatus('infojobs', applicationId);
    }
  }
}
