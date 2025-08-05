# Implementação da Integração com Catho

Este documento detalha a implementação da integração com a Catho, focando principalmente no desenvolvimento do scraper e no tratamento de captchas e outros desafios.

## 1. Análise da Plataforma Catho

Antes de implementar o scraper, é importante analisar a estrutura da plataforma Catho.

### Características da Plataforma
- Site com JavaScript intensivo
- Possível uso de proteções anti-bot
- Presença de captchas em determinadas ações
- Possível detecção de automação

### Desafios Esperados
- Captchas em login e aplicação para vagas
- Detecção de comportamento não-humano
- Possíveis bloqueios temporários de IP
- Estrutura dinâmica do site que pode mudar frequentemente

## 2. Implementação do Scraper

Implementaremos um scraper robusto para a Catho, com foco em contornar os desafios identificados.

### Serviço de Scraping da Catho

```typescript
// src/services/webscraper/CathoScraperService.ts
import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';
import { CaptchaSolverService } from '../captcha/CaptchaSolverService';

/**
 * Serviço de webscraping específico para a Catho
 */
export class CathoScraperService extends WebScraperService {
  private captchaSolver: CaptchaSolverService;

  constructor() {
    super();
    this.captchaSolver = new CaptchaSolverService();
  }

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

      // Aceita cookies se necessário
      const cookieButton = await page.$('button[data-testid="cookie-banner-accept-button"]');
      if (cookieButton) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }

      // Preenche o formulário de login
      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', credentials.username);
      await page.type('input[name="password"]', credentials.password);

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
        return document.querySelector('.user-menu') !== null ||
               document.querySelector('.user-profile') !== null;
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

    try {
      // Usa a página existente ou cria uma nova
      const page = this.pages.catho || await this.browser.newPage();
      if (!this.pages.catho) {
        await page.setUserAgent(this.config.userAgent);
        await page.setDefaultTimeout(this.config.timeout);
        this.pages.catho = page;
      }

      // Constrói a URL de busca com base nos parâmetros
      let searchUrl = 'https://www.catho.com.br/vagas/';

      if (params.keywords && params.keywords.length > 0) {
        searchUrl += encodeURIComponent(params.keywords.join(' ')) + '/';
      }

      if (params.locations && params.locations.length > 0) {
        searchUrl += encodeURIComponent(params.locations[0]) + '/';
      }

      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Aplica filtros adicionais se necessário
      if (params.remote) {
        // Clica no filtro de trabalho remoto
        const remoteFilterButton = await page.$('button[data-testid="remote-filter"]');
        if (remoteFilterButton) {
          await remoteFilterButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Espera pelos resultados da busca
      await page.waitForSelector('.job-card');

      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.job-card');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.job-title');
          const companyElement = jobElement.querySelector('.company-name');
          const locationElement = jobElement.querySelector('.job-location');
          const salaryElement = jobElement.querySelector('.job-salary');
          const linkElement = jobElement.querySelector('a.job-link');
          const dateElement = jobElement.querySelector('.job-date');

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
          const fullUrl = job.url.startsWith('http') ? job.url : `https://www.catho.com.br${job.url}`;
          await page.goto(fullUrl, { waitUntil: 'networkidle2' });
          await page.waitForSelector('.job-description');

          const jobDetails = await page.evaluate(() => {
            const descriptionElement = document.querySelector('.job-description');
            const jobTypeElement = document.querySelector('.job-type');

            return {
              description: descriptionElement ? descriptionElement.textContent?.trim() : '',
              jobType: jobTypeElement ? jobTypeElement.textContent?.trim() : ''
            };
          });

          // Extrai requisitos da descrição
          const requirements = this.extractRequirementsFromDescription(jobDetails.description || '');

          scrapedJobs.push({
            id: `catho-${Date.now()}-${i}`,
            platform: 'catho',
            title: job.title || 'Título não disponível',
            company: job.company || 'Empresa não disponível',
            location: job.location || 'Localização não disponível',
            salary: job.salary || undefined,
            description: jobDetails.description || undefined,
            requirements,
            jobType: this.mapCathoJobType(jobDetails.jobType || ''),
            workModel: this.determineWorkModel(job.location || ''),
            applicationUrl: fullUrl,
            postedDate: this.parseCathoDate(job.date || '')
          });

          // Adiciona um atraso para evitar detecção
          await this.delay(this.config.delayBetweenActions);
        }
      }

      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas na Catho:', error);

      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('catho', params);
    }
  }
```

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
      await page.waitForSelector('button[data-testid="apply-button"]');

      // Clica no botão de aplicação
      await page.click('button[data-testid="apply-button"]');

      // Verifica se há captcha
      const hasCaptcha = await page.evaluate(() => {
        return document.querySelector('iframe[title*="reCAPTCHA"]') !== null;
      });

      if (hasCaptcha) {
        console.log('Captcha detectado durante a aplicação, tentando resolver...');
        await this.solveCaptcha(page);
      }

      // Espera pela página de confirmação
      await page.waitForSelector('.application-form');

      // Preenche o formulário de aplicação se necessário
      const hasForm = await page.evaluate(() => {
        return document.querySelectorAll('.application-form input').length > 0;
      });

      if (hasForm) {
        // Preenche campos adicionais se necessário
        await page.waitForSelector('button[type="submit"]');
        await page.click('button[type="submit"]');
      }

      // Espera pela confirmação
      await page.waitForSelector('.application-success');

      return {
        id: `catho-app-${Date.now()}`,
        jobId: job.id,
        platform: 'catho',
        title: job.title,
        company: job.company,
        status: 'success',
        appliedAt: new Date(),
        applicationUrl: job.applicationUrl,
        matchScore: 85,
        resumeUsed: 'resume.pdf'
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} na Catho:`, error);

      // Em caso de erro, retorna um resultado simulado
      return {
        id: `catho-app-${Date.now()}`,
        jobId: job.id,
        platform: 'catho',
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
   * Mapeia o tipo de contrato da Catho para o formato padronizado
   */
  private mapCathoJobType(cathoType: string): string {
    const lowerType = cathoType.toLowerCase();

    if (lowerType.includes('clt') || lowerType.includes('efetivo')) {
      return 'CLT';
    }

    if (lowerType.includes('pj') || lowerType.includes('pessoa jurídica')) {
      return 'PJ';
    }

    if (lowerType.includes('estágio')) {
      return 'Estágio';
    }

    if (lowerType.includes('temporário')) {
      return 'Temporário';
    }

    return cathoType;
  }

  /**
   * Determina o modelo de trabalho com base na localização
   */
  private determineWorkModel(location: string): string {
    const lowerLocation = location.toLowerCase();

    if (lowerLocation.includes('remoto') || lowerLocation.includes('remote') || lowerLocation.includes('home office')) {
      return 'Remoto';
    }

    if (lowerLocation.includes('híbrido') || lowerLocation.includes('hybrid')) {
      return 'Híbrido';
    }

    return 'Presencial';
  }

  /**
   * Converte a data da Catho para um objeto Date
   */
  private parseCathoDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;

    // Formatos comuns: "Publicada há 2 dias", "Publicada hoje", "Publicada ontem"
    const today = new Date();

    if (dateStr.includes('hoje')) {
      return today;
    }

    if (dateStr.includes('ontem')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }

    const daysMatch = dateStr.match(/(\d+)\s+dias?/);
    if (daysMatch && daysMatch[1]) {
      const daysAgo = parseInt(daysMatch[1], 10);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      return date;
    }

    return undefined;
  }
}
```

## 3. Implementação do Serviço de Resolução de Captchas

Para lidar com os captchas encontrados na Catho, implementaremos um serviço de resolução de captchas.

### Serviço de Resolução de Captchas

```typescript
// src/services/captcha/CaptchaSolverService.ts
import axios from 'axios';

/**
 * Serviço para resolução de captchas
 */
export class CaptchaSolverService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CAPTCHA_SOLVER_API_KEY || '';
    this.baseUrl = 'https://2captcha.com/in.php';
  }

  /**
   * Resolve um reCAPTCHA v2
   */
  async solveReCaptcha(pageUrl: string, sitekey: string): Promise<string | null> {
    try {
      // Envia o captcha para o serviço
      const response = await axios.post(this.baseUrl, null, {
        params: {
          key: this.apiKey,
          method: 'userrecaptcha',
          googlekey: sitekey,
          pageurl: pageUrl,
          json: 1
        }
      });

      if (response.data.status !== 1) {
        console.error('Erro ao enviar captcha:', response.data.request);
        return null;
      }

      const requestId = response.data.request;

      // Aguarda a resolução do captcha
      const solution = await this.waitForCaptchaSolution(requestId);
      return solution;
    } catch (error) {
      console.error('Erro ao resolver reCAPTCHA:', error);
      return null;
    }
  }

  /**
   * Aguarda a resolução do captcha
   */
  private async waitForCaptchaSolution(requestId: string): Promise<string | null> {
    const maxAttempts = 30; // 30 tentativas = 15 minutos (30s entre tentativas)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        // Aguarda 30 segundos entre as verificações
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Verifica se o captcha foi resolvido
        const response = await axios.get('https://2captcha.com/res.php', {
          params: {
            key: this.apiKey,
            action: 'get',
            id: requestId,
            json: 1
          }
        });

        if (response.data.status === 1) {
          return response.data.request;
        }

        if (response.data.request !== 'CAPCHA_NOT_READY') {
          console.error('Erro ao verificar status do captcha:', response.data.request);
          return null;
        }

        attempts++;
      } catch (error) {
        console.error('Erro ao verificar status do captcha:', error);
        return null;
      }
    }

    console.error('Tempo limite excedido para resolução do captcha');
    return null;
  }
}
```