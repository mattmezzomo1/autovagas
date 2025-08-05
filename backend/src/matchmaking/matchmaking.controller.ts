import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MatchmakingService } from './matchmaking.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { CreateMatchCriteriaDto } from './dto/create-match-criteria.dto';
import { UpdateMatchCriteriaDto } from './dto/update-match-criteria.dto';
import { FindMatchesDto } from './dto/find-matches.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Matchmaking')
@Controller('matchmaking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @ApiOperation({ summary: 'Create match criteria for current user' })
  @ApiResponse({ status: 201, description: 'Match criteria created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('criteria')
  createMatchCriteria(
    @GetUser('id') userId: string,
    @Body() createMatchCriteriaDto: CreateMatchCriteriaDto,
  ) {
    return this.matchmakingService.createMatchCriteria(userId, createMatchCriteriaDto);
  }

  @ApiOperation({ summary: 'Get match criteria for current user' })
  @ApiResponse({ status: 200, description: 'Returns match criteria' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Match criteria not found' })
  @Get('criteria')
  getMatchCriteria(@GetUser('id') userId: string) {
    return this.matchmakingService.getMatchCriteria(userId);
  }

  @ApiOperation({ summary: 'Update match criteria for current user' })
  @ApiResponse({ status: 200, description: 'Match criteria updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Match criteria not found' })
  @Patch('criteria')
  updateMatchCriteria(
    @GetUser('id') userId: string,
    @Body() updateMatchCriteriaDto: UpdateMatchCriteriaDto,
  ) {
    return this.matchmakingService.updateMatchCriteria(userId, updateMatchCriteriaDto);
  }

  @ApiOperation({ summary: 'Create a match with another user' })
  @ApiResponse({ status: 201, description: 'Match created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('matches')
  createMatch(
    @GetUser('id') userId: string,
    @Body() createMatchDto: CreateMatchDto,
  ) {
    return this.matchmakingService.createMatch(userId, createMatchDto);
  }

  @ApiOperation({ summary: 'Get a specific match by ID' })
  @ApiResponse({ status: 200, description: 'Returns the match' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @Get('matches/:id')
  getMatch(@Param('id') id: string) {
    return this.matchmakingService.getMatch(id);
  }

  @ApiOperation({ summary: 'Update match status (accept/reject)' })
  @ApiResponse({ status: 200, description: 'Match status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @Patch('matches/:id/status')
  updateMatchStatus(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateMatchStatusDto: UpdateMatchStatusDto,
  ) {
    return this.matchmakingService.updateMatchStatus(id, userId, updateMatchStatusDto);
  }

  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiResponse({ status: 200, description: 'Returns all matches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('matches')
  findMatches(
    @GetUser('id') userId: string,
    @Query() findMatchesDto: FindMatchesDto,
  ) {
    return this.matchmakingService.findMatches(userId, findMatchesDto);
  }

  @ApiOperation({ summary: 'Find potential matches for current user' })
  @ApiResponse({ status: 200, description: 'Returns potential matches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('potential-matches')
  findPotentialMatches(
    @GetUser('id') userId: string,
    @Query('limit') limit: number,
  ) {
    return this.matchmakingService.findPotentialMatches(userId, limit);
  }

  @ApiOperation({ summary: 'Run matchmaking algorithm for all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Matchmaking completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @Post('run-matchmaking')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async runMatchmaking() {
    // This would typically be a background job
    // For now, we'll just return a success message
    return { message: 'Matchmaking algorithm started' };
  }
}
