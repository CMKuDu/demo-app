import { PaginationMeta } from "src/classes/pagination-meta";
import { PaginationResult } from "src/classes/pagination-response";
import { ResUserDTO } from "../dto/res/res-user.dto";
import { User } from "src/Entites/user.entity";
import { ReqUserDTO } from "../dto/req/req-user.dto";

export interface IUserService {
  getAllUser(
    query: PaginationMeta,
  ): Promise<PaginationResult<ResUserDTO | null>>;
  getUserById(dto: ReqUserDTO): Promise<User | null>;
  getUserEmail(dto: string): Promise<User>;
  saveUser(dto: Partial<User>): Promise<User>;
}
