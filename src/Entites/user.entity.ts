import { Expose } from 'class-transformer';
import { BaseEntity } from 'src/Base/entity.base';
import { Column, Entity } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @Expose()
  @Column({
    name: 'first_name',
    type: 'varchar',
    nullable: true,
  })
  firstName: string | null;
  @Expose()
  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: true,
  })
  lastName: string | null;
  @Expose()
  @Column({
    name: 'email',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  email: string | null;
  @Expose()
  @Column({
    name: 'avatar',
    type: 'varchar',
    nullable: true,
  })
  avatar: string | null;
  @Column({
    name: 'phone_number',
    type: 'varchar',
    nullable: true,
  })
  phoneNumber: string;
  @Column({
    name: 'pass_word',
    type: 'varchar',
  })
  passWord: string;
  @Column({
    name: 'old_password',
    type: 'varchar',
  })
  oldPassword: string;
  @Expose()
  @Column({
    name: 'is_banned',
    type: 'boolean',
    default: false,
  })
  isBanned: boolean;
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return this.phoneNumber || 'Unknown User';
  }

  get displayName(): string {
    return this.fullName;
  }
}
