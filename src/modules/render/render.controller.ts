import { Controller, Get } from '@nestjs/common';
import { RenderService } from './render.service';

@Controller('render')
export class RenderController {

  constructor(private readonly renderService: RenderService) {}

  @Get('callback')
  callBackRender() {
    this.renderService.callBackRender();
    return { message: 'Callback render initiated' };
  }
}
