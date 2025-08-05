export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  imageUrl?: string;
  price?: number;
  discountPrice?: number;
  duration?: string; // ex: "4 semanas", "2 meses"
  level: 'iniciante' | 'intermediário' | 'avançado';
  tags: string[]; // habilidades relacionadas
  category: string; // ex: "Programação", "Design", "Marketing"
  rating?: number; // 0-5
  createdAt: Date;
  updatedAt: Date;
}

export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
