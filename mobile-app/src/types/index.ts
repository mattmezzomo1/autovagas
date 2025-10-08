export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription?: {
    plan: 'basic' | 'plus' | 'premium';
    status: 'active' | 'inactive' | 'cancelled';
    autoApply: boolean;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  description: string;
  requirements: string[];
  postedAt: Date;
  applicationUrl?: string;
  matchScore?: number;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: 'pending' | 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedAt: Date;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  price: number;
  rating: number;
  enrolled?: boolean;
  progress?: number;
}

export interface RobotActivity {
  id: string;
  type: 'job_found' | 'application_sent' | 'analysis_complete' | 'error';
  jobId?: string;
  job?: Job;
  message: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
}

export type NavigationTab = 'dashboard' | 'robot' | 'jobs' | 'resume' | 'courses';
