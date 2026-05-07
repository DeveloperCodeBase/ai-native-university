import { Module } from '@nestjs/common';
import { ClassSessionController } from './class-session.controller';
import { ClassSessionService } from './class-session.service';

@Module({
  controllers: [ClassSessionController],
  providers: [ClassSessionService],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
