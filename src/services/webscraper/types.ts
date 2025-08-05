import { UserProfile } from '../../types/auth';

export type Platform = 'linkedin' | 'infojobs' | 'catho';

export interface ScraperCredentials {
  username: string;
  password: string;
  cookies?: Record<string, string>;
  token?: string;
}

export interface JobSearchParams {
  keywords?: string[];
  locations: string[];
  remote?: boolean;
  jobTypes: string[]; // CLT, PJ, etc.
  workModels: string[]; // Presencial, Híbrido, Remoto
  salaryMin?: number;
  workHours?: number;
  internationalJobs?: boolean;
  experienceLevel?: string;
  industries?: string[];
}

export interface ScrapedJob {
  id: string;
  platform: Platform;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  requirements?: string[];
  jobType?: string;
  workModel?: string;
  workHours?: string;
  postedDate?: Date;
  applicationUrl?: string;
  matchScore?: number;
}

export interface ApplicationResult {
  jobId: string;
  platform: Platform;
  success: boolean;
  applicationId?: string;
  applicationUrl?: string;
  error?: string;
  timestamp: Date;
}

export interface ScraperConfig {
  headless: boolean;
  timeout: number;
  userAgent: string;
  maxRetries: number;
  delayBetweenActions: number;
  humanEmulation: boolean;
  randomizeUserAgent: boolean;
  useProxy: boolean;
  proxyList: string[];
  viewportWidth: number;
  viewportHeight: number;
  minDelayMs: number;
  maxDelayMs: number;
}

export interface WebScraperServiceInterface {
  initialize(config?: Partial<ScraperConfig>): Promise<void>;
  login(platform: Platform, credentials: ScraperCredentials): Promise<boolean>;
  searchJobs(platform: Platform, params: JobSearchParams): Promise<ScrapedJob[]>;
  analyzeJobMatch(job: ScrapedJob, profile: UserProfile): number;
  applyToJob(platform: Platform, job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult>;
  checkApplicationStatus(platform: Platform, applicationId: string): Promise<string>;
  close(): Promise<void>;
}
