import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Folder } from 'src/folders/entities/folder.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Space extends BaseEntity {
  @Exclude()
  @Column({ name: 'team_id', type: 'integer' })
  teamId: number;

  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => Team, (team) => team.spaces, { orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => Folder, (folder) => folder.space, { cascade: true })
  folders: Folder[];
}
