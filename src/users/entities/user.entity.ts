import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Event } from 'src/events/entities/event.entity';
import { Membership } from 'src/memberships/entities/membership.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';

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

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];
}
