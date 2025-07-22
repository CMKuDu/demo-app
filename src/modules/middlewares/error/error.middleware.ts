import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from 'src/classes/api-response.class';
@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (err: any) {
      this.handleError(err, req, res);
    }
  }
  private handleError(err: any, req: Request, res: Response) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages = 'Internal server error';
    if (err instanceof HttpException) {
      status = err.getStatus();
      messages = err.message;
    }
    this.logError(err, req);

    // Trả về response cho client
    return res.status(status).json(new ApiResponse(status, messages));
  }
  private logError(err: any, req: Request) {
    const errorContext = {
      req: {
        url: req.originalUrl || req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: (req as any).user,
        headers: this.sanitizeHeaders(req.headers),
      },
      stack: err.stack,
    };

    const errorMessage = err.message || 'Unknown error';

    // Sử dụng logger service nếu có, nếu không thì dùng console.error
    console.error(`[ERROR] ${errorMessage}`, errorContext);
  }
  private sanitizeHeaders(headers: any) {
    // Loại bỏ các thông tin nhạy cảm từ headers
    const sanitized = { ...headers };

    // Xóa các thông tin nhạy cảm
    if (sanitized.authorization) {
      sanitized.authorization = '[REDACTED]';
    }

    if (sanitized.cookie) {
      sanitized.cookie = '[REDACTED]';
    }

    return sanitized;
  }
}
