import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Team } from 'src/teams/entities/team.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Space extends BaseEntity {
  @Exclude()
  @Column({ name: 'team_id', type: 'integer' })
  teamId: number;

  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => Team, (team) => team.spaces)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
