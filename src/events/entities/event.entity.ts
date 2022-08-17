import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { EventType } from 'src/common/enums/eventType.enum';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Event extends BaseEntity {
  @Exclude()
  @Column({ name: 'organizer_id', type: 'integer' })
  organizerId: number;

  @Exclude()
  @Column({ name: 'team_id', type: 'integer' })
  teamId: number;

  @Column('int', { name: 'participants', array: true, nullable: true })
  participants: number[];

  @Column({ name: 'type' })
  type: EventType;

  @Column({ name: 'start' })
  start: Date;

  @Column({ name: 'end' })
  end: Date;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'link', nullable: true })
  link: string;

  @Column({ name: 'approved', nullable: true })
  approved: boolean;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @ManyToOne(() => Team, (team) => team.events)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
