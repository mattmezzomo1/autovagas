import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { RecommendCoursesDto } from './dto/recommend-courses.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return this.coursesRepository.save(course);
  }

  async findAll(filters?: CourseFilterDto): Promise<Course[]> {
    const queryBuilder = this.coursesRepository.createQueryBuilder('course');

    if (filters) {
      if (filters.search) {
        queryBuilder.andWhere(
          '(course.title ILIKE :search OR course.description ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      if (filters.provider) {
        queryBuilder.andWhere('course.provider = :provider', {
          provider: filters.provider,
        });
      }

      if (filters.level) {
        queryBuilder.andWhere('course.level = :level', {
          level: filters.level,
        });
      }

      if (filters.category) {
        queryBuilder.andWhere('course.category = :category', {
          category: filters.category,
        });
      }

      if (filters.tags && filters.tags.length > 0) {
        // For simple-array columns, we need to check if any tag matches
        filters.tags.forEach((tag, index) => {
          queryBuilder.andWhere(`course.tags LIKE :tag${index}`, {
            [`tag${index}`]: `%${tag}%`,
          });
        });
      }

      if (filters.featured !== undefined) {
        queryBuilder.andWhere('course.featured = :featured', {
          featured: filters.featured,
        });
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    
    // Update course properties
    Object.assign(course, updateCourseDto);
    
    return this.coursesRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.softDelete(id);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.coursesRepository
      .createQueryBuilder('course')
      .select('DISTINCT course.category', 'category')
      .getRawMany();
    
    return categories.map(c => c.category);
  }

  async getProviders(): Promise<string[]> {
    const providers = await this.coursesRepository
      .createQueryBuilder('course')
      .select('DISTINCT course.provider', 'provider')
      .getRawMany();
    
    return providers.map(p => p.provider);
  }

  async getTags(): Promise<string[]> {
    // For simple-array columns, we need to extract all unique tags
    const courses = await this.coursesRepository.find({
      select: ['tags'],
    });
    
    const allTags = courses.flatMap(course => course.tags);
    return [...new Set(allTags)];
  }

  async recommendCourses(userId: string, dto: RecommendCoursesDto): Promise<Course[]> {
    // Get all courses
    const allCourses = await this.coursesRepository.find();
    
    // Calculate relevance score for each course
    const scoredCourses = allCourses.map(course => {
      let score = 0;
      
      // Match by skills
      dto.skills.forEach(skill => {
        if (course.tags.some(tag => 
          tag.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(tag.toLowerCase())
        )) {
          score += 2;
        }
      });
      
      // Match by job title and category
      if (course.category.toLowerCase().includes(dto.jobTitle.toLowerCase()) ||
          dto.jobTitle.toLowerCase().includes(course.category.toLowerCase())) {
        score += 3;
      }
      
      // Match by level
      if (dto.level && course.level === dto.level) {
        score += 1;
      }
      
      // Boost featured courses
      if (course.featured) {
        score += 1;
      }
      
      // Boost by rating
      if (course.rating) {
        score += course.rating / 5;
      }
      
      return { course, score };
    });
    
    // Sort by score and return top courses
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, dto.limit || 5)
      .map(item => item.course);
  }

  async enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    const course = await this.findOne(courseId);
    
    // Add user to course
    await this.coursesRepository
      .createQueryBuilder()
      .relation(Course, 'users')
      .of(course)
      .add(userId);
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    return this.coursesRepository
      .createQueryBuilder('course')
      .innerJoin('course.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }
}
