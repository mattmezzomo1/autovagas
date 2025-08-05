export interface ScrapedJob {
  id: string;
  platform: string;
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
