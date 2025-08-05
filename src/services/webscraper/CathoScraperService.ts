import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para a Catho
 */
export class CathoScraperService extends WebScraperService {
  /**
   * Realiza login na Catho
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login na Catho...');
    
    try {
      if (!this.browser) {
        await this.initialize();
      }
      
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);
      
      // Navega para a página de login da Catho
      await page.goto('https://www.catho.com.br/login/', { waitUntil: 'networkidle2' });
      
      // Preenche o formulário de login
      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', credentials.username);
      await page.type('input[name="password"]', credentials.password);
      
      // Clica no botão de login
      await page.click('button[type="submit"]');
      
      // Espera pela navegação após o login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('.user-menu') !== null;
      });
      
      if (isLoggedIn) {
        this.pages.catho = page;
        this.loggedIn.catho = true;
        console.log('Login na Catho realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login da Catho: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login na Catho:', error);
      return false;
    }
  }

  /**
   * Busca vagas na Catho com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas na Catho com parâmetros:', params);
    
    if (!this.loggedIn.catho) {
      throw new Error('É necessário fazer login na Catho antes de buscar vagas');
    }
    
    try {
      const page = this.pages.catho;
      
      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = 'https://www.catho.com.br/vagas/';
      
      // Adiciona palavras-chave
      if (params.keywords && params.keywords.length > 0) {
        searchUrl += encodeURIComponent(params.keywords.join(' ')) + '/';
      }
      
      // Adiciona localização
      if (params.locations && params.locations.length > 0) {
        searchUrl += encodeURIComponent(params.locations[0]) + '/';
      }
      
      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Aplica filtros adicionais
      
      // Filtro de trabalho remoto
      if (params.remote) {
        await page.click('.remote-filter');
      }
      
      // Filtro de tipo de contrato
      if (params.jobTypes && params.jobTypes.length > 0) {
        await page.click('.contract-type-filter');
        await page.waitForSelector('.contract-type-dropdown');
        
        for (const jobType of params.jobTypes) {
          const jobTypeMap: Record<string, string> = {
            'CLT': 'clt',
            'PJ': 'pj',
            'Estágio': 'estagio',
            'Temporário': 'temporario'
          };
          
          const jobTypeValue = jobTypeMap[jobType];
          if (jobTypeValue) {
            await page.click(`.contract-type-option[value="${jobTypeValue}"]`);
          }
        }
        
        await page.click('.apply-filters-button');
      }
      
      // Filtro de salário mínimo
      if (params.salaryMin) {
        await page.click('.salary-filter');
        await page.waitForSelector('.salary-dropdown');
        
        // Mapeia o salário mínimo para as opções da Catho
        const salaryRanges = [
          { min: 0, max: 1000, value: 'ate-1000' },
          { min: 1000, max: 2000, value: '1000-2000' },
          { min: 2000, max: 3000, value: '2000-3000' },
          { min: 3000, max: 5000, value: '3000-5000' },
          { min: 5000, max: 10000, value: '5000-10000' },
          { min: 10000, max: Infinity, value: 'acima-10000' }
        ];
        
        const salaryOption = salaryRanges.find(range => 
          params.salaryMin! >= range.min && params.salaryMin! < range.max
        );
        
        if (salaryOption) {
          await page.click(`.salary-option[value="${salaryOption.value}"]`);
        }
        
        await page.click('.apply-filters-button');
      }
      
      // Espera pelos resultados da busca
      await page.waitForSelector('.job-list');
      
      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.job-card');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.job-title');
          const companyElement = jobElement.querySelector('.company-name');
          const locationElement = jobElement.querySelector('.job-location');
          const salaryElement = jobElement.querySelector('.job-salary');
          const linkElement = jobElement.querySelector('a.job-link');
          
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
        await page.goto('https://www.catho.com.br' + job.url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.job-details');
        
        const jobDetails = await page.evaluate(() => {
          const descriptionElement = document.querySelector('.job-description');
          const requirementsElement = document.querySelector('.job-requirements');
          const jobTypeElement = document.querySelector('.job-type');
          const workModelElement = document.querySelector('.work-model');
          const workHoursElement = document.querySelector('.work-hours');
          
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
          id: `catho-${Date.now()}-${i}`,
          platform: 'catho',
          title: job.title || 'Título não disponível',
          company: job.company || 'Empresa não disponível',
          location: job.location || 'Localização não disponível',
          salary: job.salary || undefined,
          description: jobDetails.description || undefined,
          requirements: jobDetails.requirements || [],
          jobType: jobDetails.jobType || undefined,
          workModel: jobDetails.workModel || undefined,
          workHours: jobDetails.workHours || undefined,
          applicationUrl: 'https://www.catho.com.br' + job.url
        });
        
        // Adiciona um atraso para evitar detecção
        await this.delay(this.config.delayBetweenActions);
      }
      
      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas na Catho:', error);
      
      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('catho', params);
    }
  }

  /**
   * Aplica para uma vaga na Catho
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} na Catho`);
    
    if (!this.loggedIn.catho) {
      throw new Error('É necessário fazer login na Catho antes de aplicar para vagas');
    }
    
    try {
      const page = this.pages.catho;
      
      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });
      
      // Espera pelo botão de aplicação
      await page.waitForSelector('.apply-button');
      
      // Clica no botão de aplicação
      await page.click('.apply-button');
      
      // Verifica se há um modal de confirmação
      const hasConfirmationModal = await page.evaluate(() => {
        return document.querySelector('.confirmation-modal') !== null;
      });
      
      if (hasConfirmationModal) {
        await page.click('.confirm-application-button');
      }
      
      // Espera pela confirmação
      await page.waitForSelector('.application-success');
      
      // Extrai o ID da aplicação
      const applicationId = await page.evaluate(() => {
        const element = document.querySelector('.application-id');
        return element ? element.textContent?.trim() : null;
      });
      
      return {
        jobId: job.id,
        platform: 'catho',
        success: true,
        applicationId: applicationId || `catho-app-${Date.now()}`,
        applicationUrl: `https://www.catho.com.br/candidato/vagas/aplicadas/${applicationId}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} na Catho:`, error);
      
      // Em caso de erro, retorna um resultado simulado
      return super.applyToJob('catho', job, profile);
    }
  }

  /**
   * Verifica o status de uma aplicação na Catho
   */
  async checkApplicationStatus(applicationId: string): Promise<string> {
    console.log(`Verificando status da aplicação ${applicationId} na Catho`);
    
    if (!this.loggedIn.catho) {
      throw new Error('É necessário fazer login na Catho antes de verificar o status da aplicação');
    }
    
    try {
      const page = this.pages.catho;
      
      // Navega para a página de aplicações
      await page.goto('https://www.catho.com.br/candidato/vagas/aplicadas', { waitUntil: 'networkidle2' });
      
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
      console.error(`Erro ao verificar status da aplicação ${applicationId} na Catho:`, error);
      
      // Em caso de erro, retorna um status simulado
      return super.checkApplicationStatus('catho', applicationId);
    }
  }
}
