import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanySize } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private storageService: StorageService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Check if user is a company
    const user = await this.usersService.findById(userId);
    if (user.role !== UserRole.COMPANY) {
      throw new BadRequestException('Only company users can create a company profile');
    }

    // Check if company already exists for this user
    const existingCompany = await this.companiesRepository.findOne({
      where: { userId },
    });

    if (existingCompany) {
      throw new BadRequestException('Company profile already exists for this user');
    }

    // Create company
    const company = this.companiesRepository.create({
      ...createCompanyDto,
      userId,
    });

    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async findByUserId(userId: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { userId },
    });

    if (!company) {
      throw new NotFoundException(`Company profile not found for user with ID ${userId}`);
    }

    return company;
  }

  async update(userId: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findByUserId(userId);

    // Update company properties
    Object.assign(company, updateCompanyDto);

    return this.companiesRepository.save(company);
  }

  async uploadLogo(userId: string, file: Express.Multer.File): Promise<Company> {
    const company = await this.findByUserId(userId);

    // Delete old logo if exists
    if (company.logo) {
      await this.storageService.deleteFile(company.logo);
    }

    // Upload new logo
    const uploadResult = await this.storageService.uploadFile(file, 'company-logos');

    // Update company logo
    company.logo = uploadResult.path;

    return this.companiesRepository.save(company);
  }

  async remove(userId: string): Promise<void> {
    const company = await this.findByUserId(userId);

    // Delete logo if exists
    if (company.logo) {
      await this.storageService.deleteFile(company.logo);
    }

    await this.companiesRepository.remove(company);
  }
}
