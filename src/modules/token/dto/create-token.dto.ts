import { JwtSignOptions } from "@nestjs/jwt";

export class CreateToken<T>{
  payload: T;
  options?: JwtSignOptions;
}