import { User } from "src/Entites/user.entity";
import { LoginDTO } from "../req/req-login.dto";
import { ResignDTO } from "../req/req-resign.dto";

export interface IAuthService {
  registerAccount(dto: ResignDTO): Promise<{
    message: string;
    userId: number;
    userName: string;
  }>;
  
  loginAccount(dto: LoginDTO): Promise<{
    token: { accessToken: string; refreshToken: string };
    info: { user: User; userName: string; email: string };
  }>;
}