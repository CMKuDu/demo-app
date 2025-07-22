import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './modules/middlewares/error/error.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

class CustomIoAdapter extends IoAdapter {
  /**
   * Tạo máy chủ Socket.IO với cấu hình CORS
   *
   * @param port - Cổng để lắng nghe
   * @param options - Tùy chọn cấu hình khác
   * @returns Đối tượng máy chủ Socket.IO
   */
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credential: true,
        allowedHeaders: [
          'Authorization',
          'Content-Type',
          'Accept',
          'X-Requested-With',
        ],
        preflightContinue: false,
      },
      allowEIO3: true, // Hỗ trợ Socket.IO v3 và v4
      transports: ['websocket', 'polling'], // Ưu tiên websocket, sử dụng polling nếu cần
      pingTimeout: 60000, // Tăng thời gian chờ ping
      pingInterval: 25000, // Điều chỉnh khoảng thời gian ping
      cookie: false, // Tắt cookie mặc định để tránh vấn đề với CORS
      connectTimeout: 45000, // Tăng thời gian chờ kết nối
      maxHttpBufferSize: 1e7, // Tăng kích thước buffer
    });
    server.on('connection_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });
    return server;
  }
}
async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new CustomIoAdapter(app));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api/v2');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error) => {
          return `${error.property}: ${Object.values(error.constraints || []).join(', ')}`;
        });
        return new BadRequestException(messages.join('; '));
      },
    }),
  );
  // Sử dụng ErrorMiddleware với LoggerService
  const errorMiddleware = new ErrorMiddleware();
  app.use(errorMiddleware.use.bind(errorMiddleware));
  const config = new DocumentBuilder()
    .setTitle('Api Documentation')
    .setDescription('The Api Description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(configService.get<number>('PORT') || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log('WebSocket server initialized'); // Thông báo khởi tạo máy chủ WebSocket
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
