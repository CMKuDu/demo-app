import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RenderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  callBackRender() {
    const TIMECALLBACK = 300000; // 5 minutes in milliseconds
    const callbackUrl = this.configService.get<string>('CALL_BACK_RENDER_URL')  || '';

    setTimeout(() => {
      this.httpService.get(callbackUrl);
    }, TIMECALLBACK);
  }
}
