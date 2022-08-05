import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { DeleteResult } from 'typeorm';
import { BulkCreateMembershipDto } from '../dto/bulk-create-membership.dto';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { MembershipFilterDto } from '../dto/membership-filter.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { Membership } from '../entities/membership.entity';
import { MembershipsService } from '../providers/memberships.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('memberships')
@ApiBearerAuth()
@Controller({ path: '/memberships' })
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createMembership(
    @UserParam() user: User,
    @Body() createMembershipBody: CreateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.createMembership(
      createMembershipBody,
      user,
      false,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create-bulk')
  async createBulkMembership(
    @UserParam() user: User,
    @Body() createMembershipBody: BulkCreateMembershipDto,
  ): Promise<Membership[]> {
    return await this.membershipsService.bulkCreateMemberships(
      createMembershipBody.teamId,
      createMembershipBody.data,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMembershipsByTeam(
    @Query('teamId') teamId: number,
    @Query() filter: MembershipFilterDto,
    @UserParam() user: User,
  ) {
    return await this.membershipsService.getMembershipsByTeam(
      teamId,
      user,
      filter,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async updateMemberships(
    @UserParam() user: User,
    @Body() updateMembershipBody: UpdateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.updateMembership(
      updateMembershipBody,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete')
  async deleteMembership(
    @Query('userId') userId: number,
    @Query('teamId') teamId: number,
    @Query('teamId') self: boolean,
    @UserParam() operator: User,
  ): Promise<DeleteResult> {
    return await this.membershipsService.deleteMembership(
      teamId,
      userId,
      operator,
      self,
    );
  }
}
