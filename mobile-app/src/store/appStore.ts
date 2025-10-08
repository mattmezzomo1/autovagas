import { create } from 'zustand';

// Definindo os tipos diretamente aqui para evitar problemas de importação
interface Job {
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

interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: 'pending' | 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedAt: Date;
  notes?: string;
}

interface Course {
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

interface RobotActivity {
  id: string;
  type: 'job_found' | 'application_sent' | 'analysis_complete' | 'error';
  jobId?: string;
  job?: Job;
  message: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
}

interface AppState {
  // Robot
  robotActive: boolean;
  robotActivities: RobotActivity[];
  
  // Jobs
  jobs: Job[];
  applications: Application[];
  
  // Courses
  courses: Course[];
  enrolledCourses: Course[];
  
  // UI State
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>;
}

interface AppActions {
  // Robot actions
  toggleRobot: () => void;
  addRobotActivity: (activity: RobotActivity) => void;
  
  // Job actions
  setJobs: (jobs: Job[]) => void;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  
  // Course actions
  setCourses: (courses: Course[]) => void;
  enrollInCourse: (courseId: string) => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  
  // Notification actions
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  robotActive: false,
  robotActivities: [],
  jobs: [],
  applications: [],
  courses: [],
  enrolledCourses: [],
  notifications: [],

  // Robot actions
  toggleRobot: () => {
    set((state) => ({ robotActive: !state.robotActive }));
  },

  addRobotActivity: (activity: RobotActivity) => {
    set((state) => ({
      robotActivities: [activity, ...state.robotActivities].slice(0, 50), // Keep last 50
    }));
  },

  // Job actions
  setJobs: (jobs: Job[]) => {
    set({ jobs });
  },

  addApplication: (application: Application) => {
    set((state) => ({
      applications: [application, ...state.applications],
    }));
  },

  updateApplication: (id: string, updates: Partial<Application>) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      ),
    }));
  },

  // Course actions
  setCourses: (courses: Course[]) => {
    set({ courses });
  },

  enrollInCourse: (courseId: string) => {
    const course = get().courses.find((c) => c.id === courseId);
    if (course) {
      set((state) => ({
        enrolledCourses: [...state.enrolledCourses, { ...course, enrolled: true, progress: 0 }],
      }));
    }
  },

  updateCourseProgress: (courseId: string, progress: number) => {
    set((state) => ({
      enrolledCourses: state.enrolledCourses.map((course) =>
        course.id === courseId ? { ...course, progress } : course
      ),
    }));
  },

  // Notification actions
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
