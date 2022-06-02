import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Space } from 'src/spaces/entities/space.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Folder extends BaseEntity {
  @Exclude()
  @Column({ name: 'space_id', type: 'integer' })
  spaceId: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'parent', nullable: true })
  parent: number;

  @Column('int', { name: 'children', array: true, nullable: true })
  children: number[];

  @ManyToOne(() => Space, (space) => space.folders, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'space_id' })
  space: Space;
}
