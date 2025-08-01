import { HttpStatus, Injectable } from '@nestjs/common';
import { IUserService } from './interface/user-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entites/user.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { PaginationMeta } from 'src/classes/pagination-meta';
import { paginate, PaginationResult } from 'src/classes/pagination-response';
import { ResUserDTO } from './dto/res/res-user.dto';
import { ReqUserDTO } from './dto/req/req-user.dto';
import { ApiErrorException } from 'src/exceptions/api-error.exception';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {}
  async getAllUser(
    query: PaginationMeta,
  ): Promise<PaginationResult<ResUserDTO | null>> {
    const where: FindOptionsWhere<User> = {};
    const order: FindOptionsOrder<User> = {};
    return await paginate<User, ResUserDTO>(
      this.userRepository,
      where,
      query,
      ResUserDTO,
      {
        order: { create_at: 'DESC' },
        relations: [],
      },
    );
  }
  async getUserById(dto: ReqUserDTO) {
    const res = await this.userRepository.findOne({
      where: { id: dto.id },
    });
    return res;
  }
  async getUserEmail(dto: string): Promise<User> {
    const res = await this.userRepository.findOne({
      where: { email: dto },
    });
    if (!res)
      throw new ApiErrorException(
          'Không tìm thấy người dùng',
          HttpStatus.NOT_FOUND,
      );
    return res;
  }
  async saveUser(dto: any): Promise<User> {
    const newUser = await this.userRepository.save(dto);
    return newUser;
  }
}
