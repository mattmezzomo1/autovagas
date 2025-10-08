import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate, CertificateType, CertificateStatus } from '../entities/certificate.entity';
import { Course } from '../../courses/entities/course.entity';
import { Roadmap } from '../entities/roadmap.entity';
import { UserProgress, ProgressStatus } from '../entities/user-progress.entity';
import { User } from '../../users/entities/user.entity';
import * as crypto from 'crypto';

export interface CreateCertificateDto {
  title: string;
  description: string;
  type: CertificateType;
  skillsValidated?: string[];
  courseId?: string;
  roadmapId?: string;
  score?: number;
  maxScore?: number;
  expiresAt?: Date;
  metadata?: string;
}

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
  ) {}

  async create(createCertificateDto: CreateCertificateDto, userId: string): Promise<Certificate> {
    const certificateNumber = this.generateCertificateNumber();
    const digitalSignature = this.generateDigitalSignature(certificateNumber, userId);

    const certificate = this.certificateRepository.create({
      ...createCertificateDto,
      userId,
      certificateNumber,
      digitalSignature,
      status: CertificateStatus.ISSUED,
      issuedAt: new Date(),
    });

    return this.certificateRepository.save(certificate);
  }

  async findAllByUser(userId: string): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { userId },
      relations: ['course', 'roadmap'],
      order: { issuedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['course', 'roadmap', 'user'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    if (certificate.userId !== userId) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findByCertificateNumber(certificateNumber: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateNumber },
      relations: ['course', 'roadmap', 'user'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with number ${certificateNumber} not found`);
    }

    return certificate;
  }

  async verifyCertificate(certificateNumber: string): Promise<any> {
    const certificate = await this.findByCertificateNumber(certificateNumber);
    
    const isValid = this.validateDigitalSignature(
      certificate.certificateNumber,
      certificate.userId,
      certificate.digitalSignature,
    );

    const isExpired = certificate.expiresAt && new Date() > certificate.expiresAt;

    return {
      isValid: isValid && !isExpired && certificate.status === CertificateStatus.ISSUED,
      certificate: {
        title: certificate.title,
        description: certificate.description,
        type: certificate.type,
        issuer: certificate.issuer,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        skillsValidated: certificate.skillsValidated,
        recipientName: certificate.user.fullName,
        score: certificate.score,
        maxScore: certificate.maxScore,
      },
      verificationDetails: {
        certificateNumber: certificate.certificateNumber,
        isExpired,
        status: certificate.status,
        verifiedAt: new Date(),
      },
    };
  }

  async checkAndIssueCertificates(userId: string): Promise<Certificate[]> {
    const issuedCertificates: Certificate[] = [];

    // Check for course completion certificates
    const courseCompletions = await this.checkCourseCompletions(userId);
    for (const completion of courseCompletions) {
      const certificate = await this.issueCourseCompletionCertificate(userId, completion.courseId);
      if (certificate) {
        issuedCertificates.push(certificate);
      }
    }

    // Check for roadmap completion certificates
    const roadmapCompletions = await this.checkRoadmapCompletions(userId);
    for (const completion of roadmapCompletions) {
      const certificate = await this.issueRoadmapCompletionCertificate(userId, completion.roadmapId);
      if (certificate) {
        issuedCertificates.push(certificate);
      }
    }

    // Check for skill mastery certificates
    const skillMasteries = await this.checkSkillMasteries(userId);
    for (const mastery of skillMasteries) {
      const certificate = await this.issueSkillMasteryCertificate(userId, mastery.skill);
      if (certificate) {
        issuedCertificates.push(certificate);
      }
    }

    return issuedCertificates;
  }

  private async checkCourseCompletions(userId: string): Promise<{ courseId: string }[]> {
    // Find courses that are completed but don't have certificates yet
    const completedCourses = await this.progressRepository
      .createQueryBuilder('progress')
      .select('DISTINCT progress.courseId', 'courseId')
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.courseId IS NOT NULL')
      .andWhere('progress.status = :status', { status: ProgressStatus.COMPLETED })
      .andWhere('progress.progressPercentage = 100')
      .getRawMany();

    const existingCertificates = await this.certificateRepository.find({
      where: {
        userId,
        type: CertificateType.COURSE_COMPLETION,
      },
      select: ['courseId'],
    });

    const existingCourseIds = existingCertificates.map(cert => cert.courseId);
    
    return completedCourses.filter(course => 
      course.courseId && !existingCourseIds.includes(course.courseId)
    );
  }

  private async checkRoadmapCompletions(userId: string): Promise<{ roadmapId: string }[]> {
    const completedRoadmaps = await this.roadmapRepository.find({
      where: {
        userId,
        status: 'completed' as any, // Type assertion for now
        progressPercentage: 100,
      },
      select: ['id'],
    });

    const existingCertificates = await this.certificateRepository.find({
      where: {
        userId,
        type: CertificateType.ROADMAP_COMPLETION,
      },
      select: ['roadmapId'],
    });

    const existingRoadmapIds = existingCertificates.map(cert => cert.roadmapId);
    
    return completedRoadmaps
      .filter(roadmap => !existingRoadmapIds.includes(roadmap.id))
      .map(roadmap => ({ roadmapId: roadmap.id }));
  }

  private async checkSkillMasteries(userId: string): Promise<{ skill: string }[]> {
    // This would analyze user progress across multiple courses/actions to determine skill mastery
    // For now, return empty array - would need more complex logic
    return [];
  }

  private async issueCourseCompletionCertificate(userId: string, courseId: string): Promise<Certificate | null> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) return null;

    const certificateDto: CreateCertificateDto = {
      title: `Certificado de Conclusão - ${course.title}`,
      description: `Certificado de conclusão do curso "${course.title}" com carga horária de ${course.duration || 'N/A'}.`,
      type: CertificateType.COURSE_COMPLETION,
      courseId: course.id,
      skillsValidated: course.tags,
    };

    return this.create(certificateDto, userId);
  }

  private async issueRoadmapCompletionCertificate(userId: string, roadmapId: string): Promise<Certificate | null> {
    const roadmap = await this.roadmapRepository.findOne({
      where: { id: roadmapId },
      relations: ['careerGoal'],
    });

    if (!roadmap) return null;

    const certificateDto: CreateCertificateDto = {
      title: `Certificado de Roadmap - ${roadmap.title}`,
      description: `Certificado de conclusão do roadmap "${roadmap.title}" para desenvolvimento profissional.`,
      type: CertificateType.ROADMAP_COMPLETION,
      roadmapId: roadmap.id,
      skillsValidated: roadmap.keySkills,
    };

    return this.create(certificateDto, userId);
  }

  private async issueSkillMasteryCertificate(userId: string, skill: string): Promise<Certificate | null> {
    const certificateDto: CreateCertificateDto = {
      title: `Certificado de Maestria - ${skill}`,
      description: `Certificado de maestria na habilidade "${skill}" baseado em múltiplas conquistas e avaliações.`,
      type: CertificateType.SKILL_MASTERY,
      skillsValidated: [skill],
    };

    return this.create(certificateDto, userId);
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  private generateDigitalSignature(certificateNumber: string, userId: string): string {
    const data = `${certificateNumber}:${userId}:${process.env.JWT_SECRET || 'default-secret'}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private validateDigitalSignature(certificateNumber: string, userId: string, signature: string): boolean {
    const expectedSignature = this.generateDigitalSignature(certificateNumber, userId);
    return expectedSignature === signature;
  }

  async revokeCertificate(id: string, userId: string): Promise<Certificate> {
    const certificate = await this.findOne(id, userId);
    
    certificate.status = CertificateStatus.REVOKED;
    
    return this.certificateRepository.save(certificate);
  }

  async getUserCertificateStats(userId: string): Promise<any> {
    const certificates = await this.findAllByUser(userId);
    
    const totalCertificates = certificates.length;
    const certificatesByType = certificates.reduce((acc, cert) => {
      acc[cert.type] = (acc[cert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const skillsValidated = new Set();
    certificates.forEach(cert => {
      cert.skillsValidated?.forEach(skill => skillsValidated.add(skill));
    });

    return {
      totalCertificates,
      certificatesByType,
      totalSkillsValidated: skillsValidated.size,
      skillsValidated: Array.from(skillsValidated),
      latestCertificate: certificates[0] || null,
    };
  }
}
