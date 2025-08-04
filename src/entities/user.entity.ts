import { BaseEntity } from 'src/common/database/sm-base.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    length: 30,
    nullable: false,
  })
  username: string;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
    select: false,
    length: 100,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    name: 'avatar',
    nullable: true,
  })
  avatar?: string;
}
