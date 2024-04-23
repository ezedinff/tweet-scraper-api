import { Module } from '@nestjs/common';
import { TwitterModule } from './modules/twitter/twitter.module';
import { DatabaseModule } from './modules/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot(), TwitterModule],
})
export class AppModule {}
