import { Injectable } from '@nestjs/common';
import { IUserService } from './interface/user-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entites/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {}
}
