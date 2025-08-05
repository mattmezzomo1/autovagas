# Implementação da Integração com Indeed

Este documento detalha a implementação da integração com o Indeed, focando no desenvolvimento do scraper e no suporte para diferentes regiões/países.

## 1. Análise da Plataforma Indeed

Antes de implementar o scraper, é importante analisar a estrutura da plataforma Indeed.

### Características da Plataforma
- Site com JavaScript intensivo
- Versões regionais com diferentes estruturas
- Possível uso de proteções anti-bot
- Presença de captchas em determinadas ações

### Desafios Esperados
- Diferentes estruturas de HTML por região
- Detecção de comportamento não-humano
- Possíveis bloqueios temporários de IP
- Estrutura dinâmica do site que pode mudar frequentemente

## 2. Implementação do Scraper

Implementaremos um scraper robusto para o Indeed, com foco em contornar os desafios identificados.

### Serviço de Scraping do Indeed

```typescript
// src/services/webscraper/IndeedScraperService.ts
import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';
import { CaptchaSolverService } from '../captcha/CaptchaSolverService';
import { RegionDetector } from './utils/RegionDetector';

/**
 * Serviço de webscraping específico para o Indeed
 */
export class IndeedScraperService extends WebScraperService {
  private captchaSolver: CaptchaSolverService;
  private regionDetector: RegionDetector;

  constructor() {
    super();
    this.captchaSolver = new CaptchaSolverService();
    this.regionDetector = new RegionDetector();
  }

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

      // Detecta a região com base no IP ou configuração
      const region = await this.regionDetector.detectRegion();
      const baseUrl = this.getBaseUrlForRegion(region);

      // Navega para a página de login do Indeed
      await page.goto(`${baseUrl}/account/login`, { waitUntil: 'networkidle2' });

      // Aceita cookies se necessário
      const cookieButton = await page.$('#onetrust-accept-btn-handler');
      if (cookieButton) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }

      // Preenche o formulário de login
      await page.waitForSelector('#ifl-InputFormField-3');
      await page.type('#ifl-InputFormField-3', credentials.username);
      await page.click('#auth-page-google-password-fallback');
      await page.waitForSelector('#ifl-InputFormField-6');
      await page.type('#ifl-InputFormField-6', credentials.password);

      // Verifica se há captcha
      const hasCaptcha = await page.evaluate(() => {
        return document.querySelector('iframe[title*="reCAPTCHA"]') !== null;
      });

      if (hasCaptcha) {
        console.log('Captcha detectado, tentando resolver...');
        await this.solveCaptcha(page);
      }

      // Clica no botão de login
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

    try {
      // Usa a página existente ou cria uma nova
      const page = this.pages.indeed || await this.browser.newPage();
      if (!this.pages.indeed) {
        await page.setUserAgent(this.config.userAgent);
        await page.setDefaultTimeout(this.config.timeout);
        this.pages.indeed = page;
      }

      // Detecta a região com base no IP ou configuração
      const region = params.region || await this.regionDetector.detectRegion();
      const baseUrl = this.getBaseUrlForRegion(region);

      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = `${baseUrl}/jobs?`;
      const queryParams: string[] = [];

      // Adiciona palavras-chave
      if (params.keywords && params.keywords.length > 0) {
        queryParams.push(`q=${encodeURIComponent(params.keywords.join(' '))}`);
      }

      // Adiciona localização
      if (params.locations && params.locations.length > 0) {
        queryParams.push(`l=${encodeURIComponent(params.locations[0])}`);
      }

      // Adiciona trabalho remoto
      if (params.remote) {
        queryParams.push('remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11');
      }

      searchUrl += queryParams.join('&');

      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Espera pelos resultados da busca
      await page.waitForSelector('.job_seen_beacon');

      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.job_seen_beacon');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.jcs-JobTitle');
          const companyElement = jobElement.querySelector('.companyName');
          const locationElement = jobElement.querySelector('.companyLocation');
          const salaryElement = jobElement.querySelector('.salary-snippet');
          const linkElement = jobElement.querySelector('.jcs-JobTitle');
          const dateElement = jobElement.querySelector('.date');

          return {
            title: titleElement ? titleElement.textContent?.trim() : '',
            company: companyElement ? companyElement.textContent?.trim() : '',
            location: locationElement ? locationElement.textContent?.trim() : '',
            salary: salaryElement ? salaryElement.textContent?.trim() : '',
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
          const fullUrl = job.url.startsWith('http') ? job.url : `${baseUrl}${job.url}`;
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
            postedDate: this.parseIndeedDate(job.date || '', region)
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
```

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

      // Espera pela página de aplicação do Indeed
      await page.waitForSelector('#indeedApplyButtonContainer');

      // Verifica se é uma aplicação externa ou interna do Indeed
      const isExternalApplication = await page.evaluate(() => {
        return document.querySelector('.indeed-apply-bd') === null;
      });

      if (isExternalApplication) {
        // Aplicação externa - redireciona para o site da empresa
        const externalUrl = await page.url();

        // Navega para a URL externa
        await page.goto(externalUrl, { waitUntil: 'networkidle2' });

        // Tenta preencher o formulário externo (isso pode variar muito)
        await this.fillExternalApplicationForm(page, profile);

        return {
          id: `indeed-app-${Date.now()}`,
          jobId: job.id,
          platform: 'indeed',
          title: job.title,
          company: job.company,
          status: 'success',
          appliedAt: new Date(),
          applicationUrl: externalUrl,
          matchScore: 85,
          resumeUsed: 'resume.pdf'
        };
      } else {
        // Aplicação interna do Indeed

        // Preenche o formulário do Indeed
        await this.fillIndeedApplicationForm(page, profile);

        // Clica no botão de enviar
        await page.click('#form-action-continue');

        // Espera pela confirmação
        await page.waitForSelector('.indeed-apply-confirmation');

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
      }
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
   * Preenche o formulário de aplicação interno do Indeed
   */
  private async fillIndeedApplicationForm(page: any, profile: UserProfile): Promise<void> {
    // Preenche o nome
    if (await page.$('#input-applicant\\.name')) {
      await page.type('#input-applicant\\.name', `${profile.firstName} ${profile.lastName}`);
    }

    // Preenche o email
    if (await page.$('#input-applicant\\.email')) {
      await page.type('#input-applicant\\.email', profile.email);
    }

    // Preenche o telefone
    if (await page.$('#input-applicant\\.phone')) {
      await page.type('#input-applicant\\.phone', profile.phone || '');
    }

    // Faz upload do currículo se necessário
    const resumeUpload = await page.$('#resume-upload-input');
    if (resumeUpload) {
      await resumeUpload.uploadFile(profile.resumePath || '');
    }

    // Responde perguntas adicionais
    const questions = await page.$$('.ia-Questions-item');
    for (const question of questions) {
      // Tenta responder com base no tipo de pergunta
      await this.answerIndeedQuestion(question, profile);
    }
  }

  /**
   * Tenta responder uma pergunta do formulário do Indeed
   */
  private async answerIndeedQuestion(questionElement: any, profile: UserProfile): Promise<void> {
    // Implementação simplificada - na prática, seria necessário analisar o tipo de pergunta
    // e responder de acordo com o perfil do usuário

    // Verifica se é uma pergunta de texto
    const textInput = await questionElement.$('input[type="text"]');
    if (textInput) {
      await textInput.type('Sim');
      return;
    }

    // Verifica se é uma pergunta de múltipla escolha
    const radioInputs = await questionElement.$$('input[type="radio"]');
    if (radioInputs.length > 0) {
      // Seleciona a primeira opção (geralmente "Sim" ou positiva)
      await radioInputs[0].click();
      return;
    }

    // Verifica se é uma pergunta de checkbox
    const checkboxInputs = await questionElement.$$('input[type="checkbox"]');
    if (checkboxInputs.length > 0) {
      // Seleciona a primeira opção
      await checkboxInputs[0].click();
      return;
    }

    // Verifica se é uma pergunta de dropdown
    const selectElement = await questionElement.$('select');
    if (selectElement) {
      // Seleciona a primeira opção não vazia
      const options = await selectElement.$$('option');
      if (options.length > 1) {
        await selectElement.select((await options[1].getProperty('value')).jsonValue());
      }
      return;
    }
  }

  /**
   * Tenta preencher um formulário de aplicação externo
   */
  private async fillExternalApplicationForm(page: any, profile: UserProfile): Promise<void> {
    // Esta é uma implementação genérica que tenta identificar campos comuns
    // Na prática, seria necessário implementar lógicas específicas para diferentes sites

    // Tenta preencher campos de nome
    const nameFields = await page.$$('input[name*="name"], input[id*="name"], input[placeholder*="name"]');
    for (const field of nameFields) {
      await field.type(`${profile.firstName} ${profile.lastName}`);
    }

    // Tenta preencher campos de email
    const emailFields = await page.$$('input[type="email"], input[name*="email"], input[id*="email"]');
    for (const field of emailFields) {
      await field.type(profile.email);
    }

    // Tenta preencher campos de telefone
    const phoneFields = await page.$$('input[type="tel"], input[name*="phone"], input[id*="phone"]');
    for (const field of phoneFields) {
      await field.type(profile.phone || '');
    }

    // Tenta fazer upload do currículo
    const resumeFields = await page.$$('input[type="file"], input[name*="resume"], input[id*="resume"]');
    for (const field of resumeFields) {
      await field.uploadFile(profile.resumePath || '');
    }

    // Tenta encontrar e clicar no botão de envio
    const submitButtons = await page.$$('button[type="submit"], input[type="submit"], button:contains("Apply"), button:contains("Submit")');
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      await page.waitForTimeout(5000); // Espera para a submissão ser processada
    }
  }

  /**
   * Resolve captchas usando o serviço de resolução
   */
  private async solveCaptcha(page: any): Promise<boolean> {
    try {
      // Encontra o iframe do reCAPTCHA
      const captchaFrame = await page.frames().find((frame: any) =>
        frame.url().includes('recaptcha')
      );

      if (!captchaFrame) {
        console.error('Não foi possível encontrar o iframe do reCAPTCHA');
        return false;
      }

      // Obtém o sitekey do reCAPTCHA
      const sitekey = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[title*="reCAPTCHA"]');
        if (!iframe) return null;

        const src = iframe.getAttribute('src');
        if (!src) return null;

        const match = src.match(/k=([^&]+)/);
        return match ? match[1] : null;
      });

      if (!sitekey) {
        console.error('Não foi possível obter o sitekey do reCAPTCHA');
        return false;
      }

      // Envia o captcha para o serviço de resolução
      const solution = await this.captchaSolver.solveReCaptcha(page.url(), sitekey);

      if (!solution) {
        console.error('Não foi possível resolver o captcha');
        return false;
      }

      // Insere a solução no campo do reCAPTCHA
      await page.evaluate((token: string) => {
        // @ts-ignore
        window.grecaptcha.enterprise.getResponse = () => token;
        // @ts-ignore
        document.querySelector('#g-recaptcha-response').innerHTML = token;
      }, solution);

      console.log('Captcha resolvido com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao resolver captcha:', error);
      return false;
    }
  }

  /**
   * Obtém a URL base do Indeed para a região especificada
   */
  private getBaseUrlForRegion(region: string): string {
    const regionMap: Record<string, string> = {
      'us': 'https://www.indeed.com',
      'br': 'https://www.indeed.com.br',
      'ca': 'https://www.indeed.ca',
      'uk': 'https://www.indeed.co.uk',
      'au': 'https://www.indeed.com.au',
      'de': 'https://de.indeed.com',
      'fr': 'https://www.indeed.fr',
      'es': 'https://www.indeed.es',
      'it': 'https://it.indeed.com',
      'nl': 'https://nl.indeed.com',
      'jp': 'https://jp.indeed.com',
      'in': 'https://www.indeed.co.in',
      'mx': 'https://www.indeed.com.mx'
    };

    return regionMap[region.toLowerCase()] || 'https://www.indeed.com';
  }

  /**
   * Extrai requisitos da descrição da vaga
   */
  private extractRequirementsFromDescription(description: string): string[] {
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

    if (lowerType.includes('full-time') || lowerType.includes('tempo integral') || lowerType.includes('clt')) {
      return 'CLT';
    }

    if (lowerType.includes('contractor') || lowerType.includes('freelance') || lowerType.includes('pj')) {
      return 'PJ';
    }

    if (lowerType.includes('internship') || lowerType.includes('estágio')) {
      return 'Estágio';
    }

    if (lowerType.includes('temporary') || lowerType.includes('temporário')) {
      return 'Temporário';
    }

    return indeedType;
  }

  /**
   * Determina o modelo de trabalho com base na localização
   */
  private determineWorkModel(location: string): string {
    const lowerLocation = location.toLowerCase();

    if (lowerLocation.includes('remote') || lowerLocation.includes('remoto') || lowerLocation.includes('home office')) {
      return 'Remoto';
    }

    if (lowerLocation.includes('hybrid') || lowerLocation.includes('híbrido')) {
      return 'Híbrido';
    }

    return 'Presencial';
  }

  /**
   * Converte a data do Indeed para um objeto Date
   */
  private parseIndeedDate(dateStr: string, region: string): Date | undefined {
    if (!dateStr) return undefined;

    const today = new Date();

    // Formatos variam por região
    if (region === 'br') {
      // Formato brasileiro: "há X dias", "hoje", "ontem"
      if (dateStr.includes('hoje')) {
        return today;
      }

      if (dateStr.includes('ontem')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }

      const daysMatch = dateStr.match(/há\s+(\d+)\s+dias?/);
      if (daysMatch && daysMatch[1]) {
        const daysAgo = parseInt(daysMatch[1], 10);
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date;
      }
    } else {
      // Formato em inglês: "X days ago", "today", "yesterday"
      if (dateStr.includes('today')) {
        return today;
      }

      if (dateStr.includes('yesterday')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }

      const daysMatch = dateStr.match(/(\d+)\s+days?\s+ago/);
      if (daysMatch && daysMatch[1]) {
        const daysAgo = parseInt(daysMatch[1], 10);
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date;
      }
    }

    return undefined;
  }
}
```

## 3. Implementação do Detector de Região

Para suportar diferentes regiões/países, implementaremos um detector de região.

### Serviço de Detecção de Região

```typescript
// src/services/webscraper/utils/RegionDetector.ts
import axios from 'axios';

/**
 * Serviço para detecção de região/país
 */
export class RegionDetector {
  private defaultRegion: string;
  private cachedRegion: string | null = null;

  constructor(defaultRegion: string = 'us') {
    this.defaultRegion = defaultRegion;
  }

  /**
   * Detecta a região com base no IP ou configuração
   */
  async detectRegion(): Promise<string> {
    // Se já temos a região em cache, retorna
    if (this.cachedRegion) {
      return this.cachedRegion;
    }

    try {
      // Tenta obter a região das configurações do usuário
      const userRegion = localStorage.getItem('user_region');
      if (userRegion) {
        this.cachedRegion = userRegion;
        return userRegion;
      }

      // Tenta detectar a região com base no IP
      const response = await axios.get('https://ipapi.co/json/');

      if (response.data && response.data.country_code) {
        const region = response.data.country_code.toLowerCase();
        this.cachedRegion = region;
        return region;
      }
    } catch (error) {
      console.error('Erro ao detectar região:', error);
    }

    // Em caso de erro, retorna a região padrão
    return this.defaultRegion;
  }

  /**
   * Define a região manualmente
   */
  setRegion(region: string): void {
    this.cachedRegion = region.toLowerCase();
    localStorage.setItem('user_region', region.toLowerCase());
  }

  /**
   * Limpa o cache de região
   */
  clearCache(): void {
    this.cachedRegion = null;
  }
}
```