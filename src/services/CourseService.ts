import { Course, CourseFormData } from '../types/course';

// Simulação de um banco de dados local usando localStorage
const STORAGE_KEY = 'aiapply_courses';

class CourseService {
  private courses: Course[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Converter strings de data para objetos Date
        this.courses = parsedData.map((course: any) => ({
          ...course,
          createdAt: new Date(course.createdAt),
          updatedAt: new Date(course.updatedAt)
        }));
      } catch (error) {
        console.error('Erro ao carregar cursos do localStorage:', error);
        this.courses = [];
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.courses));
  }

  getAllCourses(): Course[] {
    return [...this.courses];
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(course => course.id === id);
  }

  addCourse(courseData: CourseFormData): Course {
    const now = new Date();
    const newCourse: Course = {
      ...courseData,
      id: `course_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    this.courses.push(newCourse);
    this.saveToStorage();
    return newCourse;
  }

  updateCourse(id: string, courseData: Partial<CourseFormData>): Course | null {
    const index = this.courses.findIndex(course => course.id === id);
    if (index === -1) return null;

    const updatedCourse: Course = {
      ...this.courses[index],
      ...courseData,
      updatedAt: new Date()
    };

    this.courses[index] = updatedCourse;
    this.saveToStorage();
    return updatedCourse;
  }

  deleteCourse(id: string): boolean {
    const initialLength = this.courses.length;
    this.courses = this.courses.filter(course => course.id !== id);
    
    if (this.courses.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  // Métodos para recomendação de cursos baseados em perfil
  getRecommendedCourses(skills: string[], jobTitle: string, level: string = 'iniciante'): Course[] {
    // Implementação simples de recomendação baseada em tags
    return this.courses
      .filter(course => {
        // Verifica se alguma das skills do usuário corresponde às tags do curso
        const hasMatchingSkill = course.tags.some(tag => 
          skills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()) || 
                              tag.toLowerCase().includes(skill.toLowerCase()))
        );
        
        // Verifica se o título do trabalho corresponde à categoria do curso
        const matchesJobCategory = jobTitle.toLowerCase().includes(course.category.toLowerCase()) ||
                                  course.category.toLowerCase().includes(jobTitle.toLowerCase());
        
        return hasMatchingSkill || matchesJobCategory;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Ordena por avaliação
      .slice(0, 5); // Retorna os 5 melhores
  }
}

export const courseService = new CourseService();
