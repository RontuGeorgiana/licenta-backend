import { Entity, Index, Column } from 'typeorm';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Index()
  @Column({ type: 'text', unique: true, nullable: false })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string;
}
