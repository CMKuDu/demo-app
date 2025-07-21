import { plainToInstance } from 'class-transformer';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({
    name: 'create_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;
  @Column({
    name: 'update_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  update_at: Date;
  static from<T>(this: new (...args: any[]) => T, plain: any): T {
    return plainToInstance(this, plain, {
      excludeExtraneousValues: true,
    });
  }
}
