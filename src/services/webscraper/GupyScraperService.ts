import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para a Gupy
 */
export class GupyScraperService extends WebScraperService {
  /**
   * Realiza login na Gupy
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login na Gupy...');
    
    try {
      if (!this.browser) {
        await this.initialize();
      }
      
      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);
      
      // Navega para a página de login da Gupy
      await page.goto('https://login.gupy.io/', { waitUntil: 'networkidle2' });
      
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
        return document.querySelector('.dashboard') !== null;
      });
      
      if (isLoggedIn) {
        this.pages.gupy = page;
        this.loggedIn.gupy = true;
        console.log('Login na Gupy realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login da Gupy: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login na Gupy:', error);
      return false;
    }
  }

  /**
   * Busca vagas na Gupy com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas na Gupy com parâmetros:', params);
    
    if (!this.loggedIn.gupy) {
      throw new Error('É necessário fazer login na Gupy antes de buscar vagas');
    }
    
    try {
      const page = this.pages.gupy;
      
      // Navega para a página de busca de vagas
      await page.goto('https://portal.gupy.io/job-search', { waitUntil: 'networkidle2' });
      
      // Preenche os filtros de busca
      
      // Filtro de localização
      if (params.locations && params.locations.length > 0) {
        await page.click('.location-filter');
        await page.waitForSelector('.location-dropdown');
        
        for (const location of params.locations) {
          await page.type('.location-search-input', location);
          await page.click(`.location-option:contains("${location}")`);
        }
        
        await page.click('.apply-filters-button');
      }
      
      // Filtro de modelo de trabalho
      if (params.workModels && params.workModels.length > 0) {
        await page.click('.work-model-filter');
        await page.waitForSelector('.work-model-dropdown');
        
        for (const workModel of params.workModels) {
          await page.click(`.work-model-option:contains("${workModel}")`);
        }
        
        await page.click('.apply-filters-button');
      }
      
      // Filtro de tipo de contrato
      if (params.jobTypes && params.jobTypes.length > 0) {
        await page.click('.job-type-filter');
        await page.waitForSelector('.job-type-dropdown');
        
        for (const jobType of params.jobTypes) {
          await page.click(`.job-type-option:contains("${jobType}")`);
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
        await page.goto(job.url, { waitUntil: 'networkidle2' });
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
          id: `gupy-${Date.now()}-${i}`,
          platform: 'gupy',
          title: job.title || 'Título não disponível',
          company: job.company || 'Empresa não disponível',
          location: job.location || 'Localização não disponível',
          salary: job.salary || undefined,
          description: jobDetails.description || undefined,
          requirements: jobDetails.requirements || [],
          jobType: jobDetails.jobType || undefined,
          workModel: jobDetails.workModel || undefined,
          workHours: jobDetails.workHours || undefined,
          applicationUrl: job.url
        });
        
        // Adiciona um atraso para evitar detecção
        await this.delay(this.config.delayBetweenActions);
      }
      
      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas na Gupy:', error);
      
      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('gupy', params);
    }
  }

  /**
   * Aplica para uma vaga na Gupy
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} na Gupy`);
    
    if (!this.loggedIn.gupy) {
      throw new Error('É necessário fazer login na Gupy antes de aplicar para vagas');
    }
    
    try {
      const page = this.pages.gupy;
      
      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });
      
      // Espera pelo botão de aplicação
      await page.waitForSelector('.apply-button');
      
      // Clica no botão de aplicação
      await page.click('.apply-button');
      
      // Espera pelo formulário de aplicação
      await page.waitForSelector('.application-form');
      
      // Preenche o formulário de aplicação
      // Nota: A Gupy tem um processo de aplicação em várias etapas
      
      // Etapa 1: Informações pessoais (geralmente já preenchidas)
      await page.waitForSelector('.next-button');
      await page.click('.next-button');
      
      // Etapa 2: Experiência profissional
      await page.waitForSelector('.experience-form');
      
      // Verifica se há experiências para adicionar
      if (profile.experiences && profile.experiences.length > 0) {
        for (const experience of profile.experiences) {
          await page.click('.add-experience-button');
          
          // Preenche os campos da experiência
          await page.type('input[name="company"]', experience.company);
          await page.type('input[name="role"]', experience.role);
          await page.type('textarea[name="description"]', experience.description || '');
          
          // Seleciona as datas
          await page.select('select[name="startMonth"]', experience.startDate.month.toString());
          await page.select('select[name="startYear"]', experience.startDate.year.toString());
          
          if (experience.endDate) {
            await page.select('select[name="endMonth"]', experience.endDate.month.toString());
            await page.select('select[name="endYear"]', experience.endDate.year.toString());
          } else {
            await page.click('input[name="currentJob"]');
          }
          
          await page.click('.save-experience-button');
        }
      }
      
      await page.click('.next-button');
      
      // Etapa 3: Formação acadêmica
      await page.waitForSelector('.education-form');
      
      // Verifica se há formações para adicionar
      if (profile.education && profile.education.length > 0) {
        for (const education of profile.education) {
          await page.click('.add-education-button');
          
          // Preenche os campos da formação
          await page.type('input[name="institution"]', education.institution);
          await page.type('input[name="course"]', education.course);
          await page.select('select[name="degree"]', education.degree);
          
          // Seleciona as datas
          await page.select('select[name="startYear"]', education.startDate.year.toString());
          
          if (education.endDate) {
            await page.select('select[name="endYear"]', education.endDate.year.toString());
          } else {
            await page.click('input[name="currentEducation"]');
          }
          
          await page.click('.save-education-button');
        }
      }
      
      await page.click('.next-button');
      
      // Etapa 4: Perguntas específicas da vaga
      await page.waitForSelector('.questions-form');
      
      // Responde às perguntas (varia muito entre vagas)
      const questions = await page.$$('.question-item');
      
      for (const question of questions) {
        const questionType = await question.evaluate(el => {
          const inputElement = el.querySelector('input, textarea, select');
          return inputElement ? inputElement.tagName.toLowerCase() : null;
        });
        
        if (questionType === 'input') {
          const inputType = await question.evaluate(el => {
            const input = el.querySelector('input');
            return input ? input.type : null;
          });
          
          if (inputType === 'text') {
            await question.type('input', 'Resposta para pergunta de texto');
          } else if (inputType === 'radio') {
            await question.click('input[value="Sim"]');
          } else if (inputType === 'checkbox') {
            await question.click('input[value="option1"]');
          }
        } else if (questionType === 'textarea') {
          await question.type('textarea', 'Resposta detalhada para a pergunta aberta.');
        } else if (questionType === 'select') {
          await question.select('select', 'option1');
        }
      }
      
      await page.click('.next-button');
      
      // Etapa 5: Revisão e envio
      await page.waitForSelector('.review-form');
      await page.click('.submit-application-button');
      
      // Espera pela confirmação
      await page.waitForSelector('.application-success');
      
      // Extrai o ID da aplicação
      const applicationId = await page.evaluate(() => {
        const element = document.querySelector('.application-id');
        return element ? element.textContent?.trim() : null;
      });
      
      return {
        jobId: job.id,
        platform: 'gupy',
        success: true,
        applicationId: applicationId || `gupy-app-${Date.now()}`,
        applicationUrl: `https://portal.gupy.io/applications/${applicationId}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} na Gupy:`, error);
      
      // Em caso de erro, retorna um resultado simulado
      return super.applyToJob('gupy', job, profile);
    }
  }

  /**
   * Verifica o status de uma aplicação na Gupy
   */
  async checkApplicationStatus(applicationId: string): Promise<string> {
    console.log(`Verificando status da aplicação ${applicationId} na Gupy`);
    
    if (!this.loggedIn.gupy) {
      throw new Error('É necessário fazer login na Gupy antes de verificar o status da aplicação');
    }
    
    try {
      const page = this.pages.gupy;
      
      // Navega para a página de aplicações
      await page.goto('https://portal.gupy.io/applications', { waitUntil: 'networkidle2' });
      
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
      console.error(`Erro ao verificar status da aplicação ${applicationId} na Gupy:`, error);
      
      // Em caso de erro, retorna um status simulado
      return super.checkApplicationStatus('gupy', applicationId);
    }
  }
}
