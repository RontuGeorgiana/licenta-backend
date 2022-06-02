import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Role } from 'src/common/enums/role.enum';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Membership extends BaseEntity {
  @Exclude()
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Exclude()
  @Column({ name: 'team_id', type: 'integer' })
  teamId: number;

  @Column({ name: 'role' })
  role: Role;

  @ManyToOne(() => User, (user) => user.memberships, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Team, (team) => team.memberships, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
