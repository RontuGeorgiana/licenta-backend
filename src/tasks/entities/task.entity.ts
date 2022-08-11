import { Exclude } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { BaseEntity } from 'src/common/base/base-entity.class';
import { Status } from 'src/common/enums/status.enum';
import { Folder } from 'src/folders/entities/folder.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Task extends BaseEntity {
  @Exclude()
  @Column({ name: 'folder_id', type: 'integer' })
  folderId: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'assignee', nullable: true })
  asignee: number;

  @Column({ name: 'due_date', nullable: true })
  dueDate: Date;

  @Column({ name: 'priority', nullable: true })
  priority: number;

  @Column({ name: 'status' })
  status: Status;

  @Column({ name: 'time_tracked', nullable: true })
  timeTracked: number;

  @Column({ name: 'estimation', nullable: true })
  estimation: number;

  @Column('varchar', { name: 'tags', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'parent', nullable: true })
  parent: number;

  @Column('int', { name: 'children', array: true, nullable: true })
  children: number[];

  @ManyToOne(() => Folder, (folder) => folder.tasks)
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
