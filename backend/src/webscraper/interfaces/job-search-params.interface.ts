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
