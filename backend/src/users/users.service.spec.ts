import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  password: 'hashedPassword',
  role: 'candidate',
  subscriptionPlan: 'basic',
  credits: 10,
  autoApplyEnabled: false,
};

const mockStorageService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
      
      const result = await service.findById('1');
      
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['company', 'autoApplyConfig'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);
      
      const result = await service.findByEmail('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['company', 'autoApplyConfig'],
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      
      const result = await service.findByEmail('nonexistent@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
      };
      
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockUser,
        fullName: 'Updated Name',
      } as User);
      
      const result = await service.update('1', updateUserDto);
      
      expect(result.fullName).toEqual('Updated Name');
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('updateCredits', () => {
    it('should update user credits', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockUser,
        credits: 20,
      } as User);
      
      const result = await service.updateCredits('1', 20);
      
      expect(result.credits).toEqual(20);
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
