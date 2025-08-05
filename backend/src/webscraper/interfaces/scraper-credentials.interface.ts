export interface ScraperCredentials {
  username: string;
  password: string;
  cookies?: Record<string, string>;
  token?: string;
}
