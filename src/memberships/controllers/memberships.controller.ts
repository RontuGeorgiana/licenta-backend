import { Body, Controller, Patch, Post, UseFilters } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { Membership } from '../entities/membership.entity';
import { MembershipsService } from '../providers/memberships.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('memberships')
@Controller({ path: '/memberships' })
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post('/create')
  async createMembership(
    @Body() createMembershipBody: CreateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.createMembership(createMembershipBody);
  }

  @Patch('/update')
  async updateMembership(
    @Body() updateMembershipBody: CreateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.updateMembership(updateMembershipBody);
  }
}
