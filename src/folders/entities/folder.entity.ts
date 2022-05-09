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

  @Column({ name: 'parent' })
  parent: number;

  @Column('int', { name: 'children', array: true })
  children: number[];

  @ManyToOne(() => Space, (space) => space.folders)
  @JoinColumn({ name: 'space_id' })
  space: Space;
}
