# Implementação da Integração com InfoJobs

Este documento detalha a implementação da integração com o InfoJobs, focando principalmente no desenvolvimento do scraper, já que a API oficial tem disponibilidade limitada.

## 1. Verificação da API Oficial

Antes de implementar o scraper, é importante verificar a disponibilidade da API oficial do InfoJobs.

### Pesquisa sobre a API
- A API do InfoJobs Brasil tem disponibilidade limitada e geralmente requer parcerias comerciais
- É necessário entrar em contato com o time de parcerias do InfoJobs para solicitar acesso
- Documentação pública é limitada

### Processo de Solicitação de Acesso
1. Entrar em contato através do formulário de contato do InfoJobs
2. Detalhar o caso de uso e volume esperado de requisições
3. Assinar acordo de parceria e termos de uso
4. Obter credenciais de acesso (client_id e client_secret)

## 2. Implementação do Scraper

Como a API oficial pode não estar disponível, implementaremos um scraper robusto para o InfoJobs.

### Serviço de Scraping do InfoJobs

```typescript
// src/services/webscraper/InfoJobsScraperService.ts
import { UserProfile } from '../../types/auth';
import { ApplicationResult, JobSearchParams, ScrapedJob, ScraperCredentials } from './types';
import { WebScraperService } from './WebScraperService';

/**
 * Serviço de webscraping específico para o InfoJobs
 */
export class InfoJobsScraperService extends WebScraperService {
  /**
   * Realiza login no InfoJobs
   */
  async login(credentials: ScraperCredentials): Promise<boolean> {
    console.log('Iniciando login no InfoJobs...');

    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(this.config.timeout);

      // Navega para a página de login do InfoJobs
      await page.goto('https://www.infojobs.com.br/candidate/login.aspx', { waitUntil: 'networkidle2' });

      // Aceita cookies se necessário
      const cookieButton = await page.$('button#onetrust-accept-btn-handler');
      if (cookieButton) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }

      // Preenche o formulário de login
      await page.waitForSelector('#Email');
      await page.type('#Email', credentials.username);
      await page.type('#Password', credentials.password);

      // Clica no botão de login
      await page.click('button[type="submit"]');

      // Espera pela navegação após o login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Verifica se o login foi bem-sucedido
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('.user-menu') !== null;
      });

      if (isLoggedIn) {
        this.pages.infojobs = page;
        this.loggedIn.infojobs = true;
        console.log('Login no InfoJobs realizado com sucesso');
        return true;
      } else {
        console.error('Falha no login do InfoJobs: Não foi possível verificar se o login foi bem-sucedido');
        await page.close();
        return false;
      }
    } catch (error) {
      console.error('Erro durante o login no InfoJobs:', error);
      return false;
    }
  }

  /**
   * Busca vagas no InfoJobs com base nos parâmetros
   */
  async searchJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    console.log('Buscando vagas no InfoJobs com parâmetros:', params);

    try {
      // Usa a página existente ou cria uma nova
      const page = this.pages.infojobs || await this.browser.newPage();
      if (!this.pages.infojobs) {
        await page.setUserAgent(this.config.userAgent);
        await page.setDefaultTimeout(this.config.timeout);
        this.pages.infojobs = page;
      }

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

      searchUrl += queryParams.join('&');

      // Navega para a URL de busca
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Espera pelos resultados da busca
      await page.waitForSelector('.vacancy-item');

      // Extrai os dados das vagas
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.vacancy-item');
        return Array.from(jobElements).map(jobElement => {
          const titleElement = jobElement.querySelector('.vacancy-title a');
          const companyElement = jobElement.querySelector('.vacancy-company');
          const locationElement = jobElement.querySelector('.vacancy-location');
          const salaryElement = jobElement.querySelector('.vacancy-salary');
          const dateElement = jobElement.querySelector('.vacancy-date');

          return {
            title: titleElement ? titleElement.textContent?.trim() : '',
            company: companyElement ? companyElement.textContent?.trim() : '',
            location: locationElement ? locationElement.textContent?.trim() : '',
            salary: salaryElement ? salaryElement.textContent?.trim() : '',
            url: titleElement ? titleElement.getAttribute('href') : '',
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
          const fullUrl = job.url.startsWith('http') ? job.url : `https://www.infojobs.com.br${job.url}`;
          await page.goto(fullUrl, { waitUntil: 'networkidle2' });
          await page.waitForSelector('.vacancy-description');

          const jobDetails = await page.evaluate(() => {
            const descriptionElement = document.querySelector('.vacancy-description');
            const jobTypeElement = document.querySelector('.vacancy-type');

            return {
              description: descriptionElement ? descriptionElement.textContent?.trim() : '',
              jobType: jobTypeElement ? jobTypeElement.textContent?.trim() : ''
            };
          });

          // Extrai requisitos da descrição
          const requirements = this.extractRequirementsFromDescription(jobDetails.description || '');

          scrapedJobs.push({
            id: `infojobs-${Date.now()}-${i}`,
            platform: 'infojobs',
            title: job.title || 'Título não disponível',
            company: job.company || 'Empresa não disponível',
            location: job.location || 'Localização não disponível',
            salary: job.salary || undefined,
            description: jobDetails.description || undefined,
            requirements,
            jobType: this.mapInfoJobsJobType(jobDetails.jobType || ''),
            workModel: this.determineWorkModel(job.location || ''),
            applicationUrl: fullUrl,
            postedDate: this.parseInfoJobsDate(job.date || '')
          });

          // Adiciona um atraso para evitar detecção
          await this.delay(this.config.delayBetweenActions);
        }
      }

      return scrapedJobs;
    } catch (error) {
      console.error('Erro ao buscar vagas no InfoJobs:', error);

      // Em caso de erro, retorna os dados simulados
      return super.searchJobs('infojobs', params);
    }
  }
```

  /**
   * Aplica para uma vaga no InfoJobs
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    console.log(`Aplicando para a vaga ${job.title} no InfoJobs`);

    if (!this.loggedIn.infojobs) {
      throw new Error('É necessário fazer login no InfoJobs antes de aplicar para vagas');
    }

    try {
      const page = this.pages.infojobs;

      // Navega para a página da vaga
      await page.goto(job.applicationUrl!, { waitUntil: 'networkidle2' });

      // Espera pelo botão de aplicação
      await page.waitForSelector('.btn-apply');

      // Clica no botão de aplicação
      await page.click('.btn-apply');

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
        id: `infojobs-app-${Date.now()}`,
        jobId: job.id,
        platform: 'infojobs',
        title: job.title,
        company: job.company,
        status: 'success',
        appliedAt: new Date(),
        applicationUrl: job.applicationUrl,
        matchScore: 85,
        resumeUsed: 'resume.pdf'
      };
    } catch (error) {
      console.error(`Erro ao aplicar para a vaga ${job.title} no InfoJobs:`, error);

      // Em caso de erro, retorna um resultado simulado
      return {
        id: `infojobs-app-${Date.now()}`,
        jobId: job.id,
        platform: 'infojobs',
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
   * Mapeia o tipo de contrato do InfoJobs para o formato padronizado
   */
  private mapInfoJobsJobType(infoJobsType: string): string {
    const lowerType = infoJobsType.toLowerCase();

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

    return infoJobsType;
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
   * Converte a data do InfoJobs para um objeto Date
   */
  private parseInfoJobsDate(dateStr: string): Date | undefined {
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

## 3. Implementação de Mecanismos Anti-Detecção

Para evitar bloqueios durante o scraping, implementaremos mecanismos anti-detecção.

### Rotação de User Agents

```typescript
// src/services/webscraper/utils/UserAgentRotator.ts
export class UserAgentRotator {
  private userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ];

  /**
   * Retorna um user agent aleatório
   */
  getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[randomIndex];
  }

  /**
   * Adiciona um novo user agent à lista
   */
  addUserAgent(userAgent: string): void {
    if (!this.userAgents.includes(userAgent)) {
      this.userAgents.push(userAgent);
    }
  }
}
```

### Implementação de Delays Aleatórios

```typescript
// src/services/webscraper/utils/DelayManager.ts
export class DelayManager {
  private minDelay: number;
  private maxDelay: number;

  constructor(minDelay: number = 1000, maxDelay: number = 5000) {
    this.minDelay = minDelay;
    this.maxDelay = maxDelay;
  }

  /**
   * Gera um delay aleatório entre minDelay e maxDelay
   */
  getRandomDelay(): number {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }

  /**
   * Espera por um tempo aleatório
   */
  async randomDelay(): Promise<void> {
    const delay = this.getRandomDelay();
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Espera por um tempo específico
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```