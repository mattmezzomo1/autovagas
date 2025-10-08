import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModulesService, CreateModuleDto } from '../services/modules.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ModuleStatus } from '../entities/module.entity';

@ApiTags('modules')
@Controller('courses/:courseId/modules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module in a course' })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  create(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all modules for a course' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully' })
  findAll(@Param('courseId') courseId: string) {
    return this.modulesService.findAllByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific module' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get user progress for a module' })
  @ApiResponse({ status: 200, description: 'Module progress retrieved successfully' })
  getProgress(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.modulesService.getModuleProgress(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateModuleDto: Partial<CreateModuleDto>,
  ) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update module status' })
  @ApiResponse({ status: 200, description: 'Module status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ModuleStatus,
  ) {
    return this.modulesService.updateStatus(id, status);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder modules in a course' })
  @ApiResponse({ status: 200, description: 'Modules reordered successfully' })
  reorder(
    @Param('courseId') courseId: string,
    @Body() moduleOrders: { id: string; order: number }[],
  ) {
    return this.modulesService.reorderModules(courseId, moduleOrders);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
