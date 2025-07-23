import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationMeta } from 'src/classes/pagination-meta';
import { ApiResponse } from 'src/classes/api-response.class';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-all-user-admin')
  async getAllUserAdmin(@Query() query: PaginationMeta) {
    const res = await this.userService.getAllUser(query);
    return new ApiResponse(
      HttpStatus.OK,
      'Lấy danh sách danh mục thành công',
      res,
    );
  }
  @Get('get-user-by-email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const res = await this.userService.getUserEmail(email);
    return new ApiResponse(
      HttpStatus.OK,
      'Lấy danh sách danh mục thành công',
      res,
    );
  }
}
