import { Module } from '@nestjs/common';
import { RenderService } from './render.service';
import { RenderController } from './render.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [RenderService],
  controllers: [RenderController],
  imports: [HttpModule],
})
export class RenderModule {}
