import { BaseEntity } from 'src/common/base/base-entity.class';
import { Membership } from 'src/memberships/entities/membership.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Team extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @OneToMany(() => Membership, (membership) => membership.team)
  memberships: Membership[];
}
