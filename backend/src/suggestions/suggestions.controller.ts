import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { SuggestionType } from './entities/suggestion.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Suggestions')
@Controller('suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @ApiOperation({ summary: 'Get all suggestions' })
  @ApiResponse({ status: 200, description: 'Returns all suggestions' })
  @ApiQuery({ name: 'type', required: false, enum: SuggestionType, description: 'Filter by suggestion type' })
  @Public()
  @Get()
  findAll(@Query('type') type?: SuggestionType, @GetUser('id') userId?: string) {
    if (type) {
      return this.suggestionsService.findByType(type, userId);
    }
    return this.suggestionsService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get a specific suggestion' })
  @ApiResponse({ status: 200, description: 'Returns the suggestion' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suggestionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Analyze resume for personalized suggestions' })
  @ApiResponse({ status: 200, description: 'Returns analysis and suggestions' })
  @ApiResponse({ status: 400, description: 'Bad request or not enough credits' })
  @ApiBearerAuth()
  @Post('analyze')
  @Roles(UserRole.CANDIDATE)
  analyzeResume(@GetUser('id') userId: string, @Body() analyzeResumeDto: AnalyzeResumeDto) {
    return this.suggestionsService.analyzeResume(userId, analyzeResumeDto);
  }
}
