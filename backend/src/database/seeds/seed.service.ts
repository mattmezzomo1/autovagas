import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, SubscriptionPlan } from '../../users/entities/user.entity';
import { Company, CompanySize } from '../../companies/entities/company.entity';
import { Suggestion, SuggestionType } from '../../suggestions/entities/suggestion.entity';
import { Course, CourseLevel } from '../../courses/entities/course.entity';
import { Match } from '../../matchmaking/entities/match.entity';
import { MatchCriteria } from '../../matchmaking/entities/match-criteria.entity';
import { seedCourses } from './courses.seed';
import { seedMatchmaking } from './matchmaking.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Suggestion)
    private suggestionsRepository: Repository<Suggestion>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchCriteria)
    private matchCriteriaRepository: Repository<MatchCriteria>,
  ) {}

  async seed() {
    await this.seedUsers();
    await this.seedCompanies();
    await this.seedSuggestions();
    await this.seedCourses();
    await this.seedMatchmaking();
    this.logger.log('Seeding completed successfully');
  }

  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) {
      this.logger.log('Users table already has data, skipping seeding');
      return;
    }

    this.logger.log('Seeding users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = this.usersRepository.create({
      email: 'admin@jobhunt.com',
      fullName: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      subscriptionPlan: SubscriptionPlan.PREMIUM,
      credits: 1000,
      autoApplyEnabled: true,
    });
    await this.usersRepository.save(admin);

    // Create company user
    const companyPassword = await bcrypt.hash('company123', 10);
    const company = this.usersRepository.create({
      email: 'company@example.com',
      fullName: 'Example Company',
      password: companyPassword,
      role: UserRole.COMPANY,
      subscriptionPlan: SubscriptionPlan.PLUS,
      credits: 100,
    });
    await this.usersRepository.save(company);

    // Create candidate user
    const candidatePassword = await bcrypt.hash('candidate123', 10);
    const candidate = this.usersRepository.create({
      email: 'candidate@example.com',
      fullName: 'John Doe',
      password: candidatePassword,
      role: UserRole.CANDIDATE,
      subscriptionPlan: SubscriptionPlan.BASIC,
      credits: 10,
      title: 'Software Developer',
      experience: 5,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'SQL'],
      bio: 'Experienced software developer with a passion for building web applications.',
      location: 'São Paulo, Brazil',
      jobTypes: ['CLT', 'PJ'],
      workModels: ['REMOTE', 'HYBRID'],
      salaryExpectationMin: 5000,
      salaryExpectationMax: 10000,
      industries: ['Technology', 'Finance', 'E-commerce'],
      locations: ['São Paulo', 'Rio de Janeiro', 'Remote'],
    });
    await this.usersRepository.save(candidate);

    this.logger.log('Users seeded successfully');
  }

  private async seedCompanies() {
    const count = await this.companiesRepository.count();
    if (count > 0) {
      this.logger.log('Companies table already has data, skipping seeding');
      return;
    }

    this.logger.log('Seeding companies...');

    // Get company user
    const companyUser = await this.usersRepository.findOne({
      where: { email: 'company@example.com' },
    });

    if (!companyUser) {
      this.logger.warn('Company user not found, skipping company seeding');
      return;
    }

    // Create company profile
    const company = this.companiesRepository.create({
      name: 'Example Company',
      description: 'A leading technology company specializing in web and mobile applications.',
      website: 'https://example.com',
      industry: 'Technology',
      size: CompanySize.MEDIUM,
      location: 'São Paulo, Brazil',
      foundingYear: 2010,
      linkedinUrl: 'https://linkedin.com/company/example',
      benefits: [
        'Health Insurance',
        'Dental Insurance',
        'Flexible Hours',
        'Remote Work',
        'Professional Development',
      ],
      culture: [
        'Innovative',
        'Collaborative',
        'Customer-Focused',
        'Agile',
        'Inclusive',
      ],
      userId: companyUser.id,
    });
    await this.companiesRepository.save(company);

    this.logger.log('Companies seeded successfully');
  }

  private async seedSuggestions() {
    const count = await this.suggestionsRepository.count();
    if (count > 0) {
      this.logger.log('Suggestions table already has data, skipping seeding');
      return;
    }

    this.logger.log('Seeding suggestions...');

    // Create featured suggestions
    const suggestions = [
      {
        title: 'React Complete Course',
        description: 'Master React.js with this comprehensive course covering hooks, context, and advanced patterns.',
        type: SuggestionType.COURSE,
        provider: 'Udemy',
        originalPrice: 199.99,
        discountPrice: 29.99,
        discountPercentage: 85,
        relevance: 5,
        duration: '20 hours',
        link: 'https://www.udemy.com/course/react-complete-guide',
        image: 'https://example.com/images/react-course.jpg',
        tags: ['React', 'JavaScript', 'Frontend'],
        isFeatured: true,
      },
      {
        title: 'Node.js Developer Certification',
        description: 'Become a certified Node.js developer and boost your career prospects.',
        type: SuggestionType.CERTIFICATION,
        provider: 'OpenJS Foundation',
        originalPrice: 299.99,
        discountPrice: 199.99,
        discountPercentage: 33,
        relevance: 4,
        duration: '3 months',
        link: 'https://openjsf.org/certification',
        image: 'https://example.com/images/nodejs-cert.jpg',
        tags: ['Node.js', 'JavaScript', 'Backend'],
        isFeatured: true,
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        description: 'Learn how to write clean, maintainable code that will impress your colleagues and future employers.',
        type: SuggestionType.BOOK,
        provider: 'Amazon',
        originalPrice: 49.99,
        discountPrice: 39.99,
        discountPercentage: 20,
        relevance: 5,
        link: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
        image: 'https://example.com/images/clean-code-book.jpg',
        tags: ['Programming', 'Best Practices', 'Software Development'],
        isFeatured: true,
      },
      {
        title: 'AWS Cloud Practitioner Training',
        description: 'Get started with AWS and prepare for the Cloud Practitioner certification.',
        type: SuggestionType.TRAINING,
        provider: 'AWS',
        originalPrice: 99.99,
        discountPrice: 0,
        discountPercentage: 100,
        relevance: 4,
        duration: '10 hours',
        link: 'https://aws.amazon.com/training/learn-about/cloud-practitioner',
        image: 'https://example.com/images/aws-training.jpg',
        tags: ['AWS', 'Cloud', 'DevOps'],
        isFeatured: true,
      },
      {
        title: 'TypeScript Masterclass',
        description: 'Take your TypeScript skills to the next level with advanced types, generics, and more.',
        type: SuggestionType.COURSE,
        provider: 'Frontend Masters',
        originalPrice: 149.99,
        discountPrice: 99.99,
        discountPercentage: 33,
        relevance: 4,
        duration: '12 hours',
        link: 'https://frontendmasters.com/courses/typescript-v2',
        image: 'https://example.com/images/typescript-course.jpg',
        tags: ['TypeScript', 'JavaScript', 'Programming'],
        isFeatured: true,
      },
    ];

    for (const suggestion of suggestions) {
      await this.suggestionsRepository.save(this.suggestionsRepository.create(suggestion));
    }

    this.logger.log('Suggestions seeded successfully');
  }

  private async seedCourses() {
    const count = await this.coursesRepository.count();
    if (count > 0) {
      this.logger.log('Courses table already has data, skipping seeding');
      return;
    }

    this.logger.log('Seeding courses...');

    // Use the seedCourses function to seed courses
    await seedCourses(this.coursesRepository.manager.connection);

    this.logger.log('Courses seeded successfully');
  }

  private async seedMatchmaking() {
    const matchCount = await this.matchRepository.count();
    const criteriaCount = await this.matchCriteriaRepository.count();

    if (matchCount > 0 && criteriaCount > 0) {
      this.logger.log('Matchmaking tables already have data, skipping seeding');
      return;
    }

    this.logger.log('Seeding matchmaking data...');

    // Use the seedMatchmaking function to seed matchmaking data
    await seedMatchmaking(this.matchRepository.manager.connection);

    this.logger.log('Matchmaking data seeded successfully');
  }
}
