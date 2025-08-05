export interface UserProfile {
  id?: string;
  email: string;
  fullName: string;
  phone: string;
  location: string;
  title: string;
  experience: number;
  skills: string[];
  bio: string;
  profileImage?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resume?: File;
  jobTypes: string[];
  workModels: string[];
  salaryExpectation: {
    min: number;
    max: number;
  };
  industries: string[];
  locations: string[];
  role?: 'candidate' | 'company' | 'admin';
  subscription: {
    plan: 'basic' | 'plus' | 'premium';
    credits: number;
    autoApply: boolean;
    autoApplyConfig?: {
      workHours: number;
      internationalJobs: boolean;
    };
  };
}

export interface SignupStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface Plan {
  id: 'basic' | 'plus' | 'premium';
  name: string;
  price: number;
  annualPrice: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
  automationType: 'extension' | 'cloud';
  description: string;
}

export type SignupSteps = SignupStep[];