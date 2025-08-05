import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { MatchCriteria } from './entities/match-criteria.entity';
import { User } from '../users/entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { CreateMatchCriteriaDto } from './dto/create-match-criteria.dto';
import { UpdateMatchCriteriaDto } from './dto/update-match-criteria.dto';
import { FindMatchesDto } from './dto/find-matches.dto';

@Injectable()
export class MatchmakingService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchCriteria)
    private matchCriteriaRepository: Repository<MatchCriteria>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMatchCriteria(userId: string, createMatchCriteriaDto: CreateMatchCriteriaDto): Promise<MatchCriteria> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if criteria already exists
    const existingCriteria = await this.matchCriteriaRepository.findOne({
      where: { userId },
    });

    if (existingCriteria) {
      throw new BadRequestException('Match criteria already exists for this user');
    }

    // Create new criteria
    const criteria = this.matchCriteriaRepository.create({
      userId,
      ...createMatchCriteriaDto,
    });

    return this.matchCriteriaRepository.save(criteria);
  }

  async getMatchCriteria(userId: string): Promise<MatchCriteria> {
    const criteria = await this.matchCriteriaRepository.findOne({
      where: { userId },
    });

    if (!criteria) {
      throw new NotFoundException(`Match criteria for user with ID ${userId} not found`);
    }

    return criteria;
  }

  async updateMatchCriteria(userId: string, updateMatchCriteriaDto: UpdateMatchCriteriaDto): Promise<MatchCriteria> {
    const criteria = await this.getMatchCriteria(userId);
    
    // Update criteria properties
    Object.assign(criteria, updateMatchCriteriaDto);
    
    return this.matchCriteriaRepository.save(criteria);
  }

  async createMatch(initiatorId: string, createMatchDto: CreateMatchDto): Promise<Match> {
    // Check if users exist
    const initiator = await this.userRepository.findOne({
      where: { id: initiatorId },
    });

    if (!initiator) {
      throw new NotFoundException(`User with ID ${initiatorId} not found`);
    }

    const receiver = await this.userRepository.findOne({
      where: { id: createMatchDto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException(`User with ID ${createMatchDto.receiverId} not found`);
    }

    // Check if match already exists
    const existingMatch = await this.matchRepository.findOne({
      where: [
        { initiatorId, receiverId: createMatchDto.receiverId },
        { initiatorId: createMatchDto.receiverId, receiverId: initiatorId },
      ],
    });

    if (existingMatch) {
      throw new BadRequestException('Match already exists between these users');
    }

    // Calculate match score
    const score = await this.calculateMatchScore(initiatorId, createMatchDto.receiverId);

    // Create new match
    const match = this.matchRepository.create({
      initiatorId,
      receiverId: createMatchDto.receiverId,
      score,
      notes: createMatchDto.notes,
      matchReasons: createMatchDto.matchReasons,
    });

    return this.matchRepository.save(match);
  }

  async getMatch(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['initiator', 'receiver'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async updateMatchStatus(id: string, userId: string, updateMatchStatusDto: UpdateMatchStatusDto): Promise<Match> {
    const match = await this.getMatch(id);

    // Check if user is the receiver of the match
    if (match.receiverId !== userId) {
      throw new BadRequestException('Only the match receiver can update the status');
    }

    // Update match status
    match.status = updateMatchStatusDto.status;
    match.notes = updateMatchStatusDto.notes || match.notes;
    match.respondedAt = new Date();

    return this.matchRepository.save(match);
  }

  async findMatches(userId: string, findMatchesDto: FindMatchesDto): Promise<Match[]> {
    const queryBuilder = this.matchRepository.createQueryBuilder('match')
      .leftJoinAndSelect('match.initiator', 'initiator')
      .leftJoinAndSelect('match.receiver', 'receiver')
      .where('(match.initiator_id = :userId OR match.receiver_id = :userId)', { userId });

    if (findMatchesDto.status) {
      queryBuilder.andWhere('match.status = :status', { status: findMatchesDto.status });
    }

    if (findMatchesDto.minScore) {
      queryBuilder.andWhere('match.score >= :minScore', { minScore: findMatchesDto.minScore });
    }

    // Order by created date (newest first)
    queryBuilder.orderBy('match.created_at', 'DESC');

    // Limit results
    queryBuilder.take(findMatchesDto.limit || 10);

    return queryBuilder.getMany();
  }

  async findPotentialMatches(userId: string, limit: number = 10): Promise<any[]> {
    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user's match criteria
    let criteria: MatchCriteria;
    try {
      criteria = await this.getMatchCriteria(userId);
    } catch (error) {
      // If no criteria exists, use default values
      criteria = {
        enabled: true,
        minExperienceYears: 0,
        maxExperienceYears: 100,
        desiredSkills: user.skills || [],
        excludedSkills: [],
        industries: user.industries || [],
        locations: user.locations || [],
        remoteOnly: false,
        maxMatchesPerWeek: 5,
        notificationsEnabled: true,
      } as MatchCriteria;
    }

    // If matchmaking is disabled, return empty array
    if (!criteria.enabled) {
      return [];
    }

    // Get existing matches to exclude
    const existingMatches = await this.matchRepository.find({
      where: [
        { initiatorId: userId },
        { receiverId: userId },
      ],
    });

    const excludedUserIds = existingMatches.map(match => 
      match.initiatorId === userId ? match.receiverId : match.initiatorId
    );

    // Add current user to excluded list
    excludedUserIds.push(userId);

    // Find potential matches
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.id NOT IN (:...excludedUserIds)', { excludedUserIds });

    // Apply criteria filters
    if (criteria.minExperienceYears) {
      queryBuilder.andWhere('user.experience >= :minExperience', { minExperience: criteria.minExperienceYears });
    }

    if (criteria.maxExperienceYears) {
      queryBuilder.andWhere('user.experience <= :maxExperience', { maxExperience: criteria.maxExperienceYears });
    }

    if (criteria.industries && criteria.industries.length > 0) {
      // For simple-array columns, we need to check if any industry matches
      criteria.industries.forEach((industry, index) => {
        queryBuilder.andWhere(`user.industries LIKE :industry${index}`, {
          [`industry${index}`]: `%${industry}%`,
        });
      });
    }

    if (criteria.locations && criteria.locations.length > 0 && !criteria.remoteOnly) {
      // For simple-array columns, we need to check if any location matches
      const locationConditions = criteria.locations.map((location, index) => {
        queryBuilder.setParameter(`location${index}`, `%${location}%`);
        return `user.locations LIKE :location${index}`;
      });
      
      queryBuilder.andWhere(`(${locationConditions.join(' OR ')})`);
    }

    if (criteria.remoteOnly) {
      queryBuilder.andWhere(`user.locations LIKE :remote`, { remote: '%Remote%' });
    }

    // Get potential matches
    const potentialMatches = await queryBuilder.limit(limit * 2).getMany();

    // Calculate match scores and sort
    const scoredMatches = await Promise.all(
      potentialMatches.map(async (potentialMatch) => {
        const score = await this.calculateMatchScore(userId, potentialMatch.id);
        return {
          user: potentialMatch,
          score,
          matchReasons: await this.generateMatchReasons(user, potentialMatch),
        };
      })
    );

    // Sort by score (highest first) and limit results
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async calculateMatchScore(userId1: string, userId2: string): Promise<number> {
    const user1 = await this.userRepository.findOne({
      where: { id: userId1 },
    });

    const user2 = await this.userRepository.findOne({
      where: { id: userId2 },
    });

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    let score = 0;
    const maxScore = 100;

    // Match by skills (30% of score)
    const user1Skills = user1.skills || [];
    const user2Skills = user2.skills || [];
    
    // Calculate skill overlap
    const skillOverlap = user1Skills.filter(skill => 
      user2Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    
    // Calculate skill complementarity (skills that one has but the other doesn't)
    const user1UniqueSkills = user1Skills.filter(skill => 
      !user2Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    
    const user2UniqueSkills = user2Skills.filter(skill => 
      !user1Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    
    const skillComplementarity = user1UniqueSkills + user2UniqueSkills;
    
    // Calculate skill score (balance between overlap and complementarity)
    const totalSkills = user1Skills.length + user2Skills.length;
    const skillScore = totalSkills > 0 
      ? (skillOverlap * 15 + skillComplementarity * 15) / totalSkills 
      : 0;
    
    score += Math.min(30, skillScore);

    // Match by industry (20% of score)
    const user1Industries = user1.industries || [];
    const user2Industries = user2.industries || [];
    
    const industryOverlap = user1Industries.filter(industry => 
      user2Industries.includes(industry)
    ).length;
    
    const industryScore = Math.min(user1Industries.length, user2Industries.length) > 0
      ? (industryOverlap / Math.min(user1Industries.length, user2Industries.length)) * 20
      : 0;
    
    score += industryScore;

    // Match by location (15% of score)
    const user1Locations = user1.locations || [];
    const user2Locations = user2.locations || [];
    
    const locationOverlap = user1Locations.filter(location => 
      user2Locations.includes(location)
    ).length;
    
    const locationScore = Math.min(user1Locations.length, user2Locations.length) > 0
      ? (locationOverlap / Math.min(user1Locations.length, user2Locations.length)) * 15
      : 0;
    
    score += locationScore;

    // Match by experience level (15% of score)
    const experienceDifference = Math.abs((user1.experience || 0) - (user2.experience || 0));
    const experienceScore = Math.max(0, 15 - experienceDifference * 3); // Deduct 3 points per year of difference
    
    score += experienceScore;

    // Match by job types (10% of score)
    const user1JobTypes = user1.jobTypes || [];
    const user2JobTypes = user2.jobTypes || [];
    
    const jobTypeOverlap = user1JobTypes.filter(jobType => 
      user2JobTypes.includes(jobType)
    ).length;
    
    const jobTypeScore = Math.min(user1JobTypes.length, user2JobTypes.length) > 0
      ? (jobTypeOverlap / Math.min(user1JobTypes.length, user2JobTypes.length)) * 10
      : 0;
    
    score += jobTypeScore;

    // Match by work models (10% of score)
    const user1WorkModels = user1.workModels || [];
    const user2WorkModels = user2.workModels || [];
    
    const workModelOverlap = user1WorkModels.filter(workModel => 
      user2WorkModels.includes(workModel)
    ).length;
    
    const workModelScore = Math.min(user1WorkModels.length, user2WorkModels.length) > 0
      ? (workModelOverlap / Math.min(user1WorkModels.length, user2WorkModels.length)) * 10
      : 0;
    
    score += workModelScore;

    // Ensure score is between 0 and 100
    return Math.min(maxScore, Math.max(0, Math.round(score)));
  }

  private async generateMatchReasons(user1: User, user2: User): Promise<string[]> {
    const reasons: string[] = [];

    // Skills overlap
    const user1Skills = user1.skills || [];
    const user2Skills = user2.skills || [];
    
    const sharedSkills = user1Skills.filter(skill => 
      user2Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    
    if (sharedSkills.length > 0) {
      reasons.push(`Compartilham ${sharedSkills.length} habilidades, incluindo ${sharedSkills.slice(0, 3).join(', ')}`);
    }

    // Complementary skills
    const user1UniqueSkills = user1Skills.filter(skill => 
      !user2Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    
    const user2UniqueSkills = user2Skills.filter(skill => 
      !user1Skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    
    if (user1UniqueSkills.length > 0 && user2UniqueSkills.length > 0) {
      reasons.push(`Habilidades complementares: você tem ${user1UniqueSkills.slice(0, 2).join(', ')} e ${user2.fullName} tem ${user2UniqueSkills.slice(0, 2).join(', ')}`);
    }

    // Industry match
    const user1Industries = user1.industries || [];
    const user2Industries = user2.industries || [];
    
    const sharedIndustries = user1Industries.filter(industry => 
      user2Industries.includes(industry)
    );
    
    if (sharedIndustries.length > 0) {
      reasons.push(`Interesse em indústrias similares: ${sharedIndustries.slice(0, 2).join(', ')}`);
    }

    // Location match
    const user1Locations = user1.locations || [];
    const user2Locations = user2.locations || [];
    
    const sharedLocations = user1Locations.filter(location => 
      user2Locations.includes(location)
    );
    
    if (sharedLocations.length > 0) {
      reasons.push(`Localizações em comum: ${sharedLocations.slice(0, 2).join(', ')}`);
    }

    // Experience level
    if (user1.experience && user2.experience) {
      const experienceDifference = Math.abs(user1.experience - user2.experience);
      if (experienceDifference <= 2) {
        reasons.push(`Nível de experiência similar: ${user1.experience} e ${user2.experience} anos`);
      }
    }

    return reasons;
  }
}
