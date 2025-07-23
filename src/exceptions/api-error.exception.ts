import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiErrorException extends HttpException {
    constructor(
        message: string = HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
        status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        super(message, status);
        return this;
    }
}
