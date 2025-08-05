export interface ApplicationResult {
  jobId: string;
  platform: string;
  success: boolean;
  applicationId?: string;
  applicationUrl?: string;
  error?: string;
  timestamp: Date;
}
