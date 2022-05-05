import {
  Body,
  Controller,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateMembershipDto } from '../dto/create-membership.dto';
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
  @Patch('/update')
  async updateMembership(
    @UserParam() user: User,
    @Body() updateMembershipBody: CreateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.updateMembership(
      updateMembershipBody,
      user,
    );
  }
}
