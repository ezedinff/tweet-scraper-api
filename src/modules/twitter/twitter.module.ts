import { Module } from '@nestjs/common';
import { ScraperService } from './services/scraper.service';
import { TwitterController } from './controllers/twitter.controller';
import { CommonModule } from '../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetEntity } from './models/tweet.entity';
import { TweetScraperJob } from './jobs/tweet-scraper.job';
import { TweetRepository } from './repositories/tweet.repository';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([TweetEntity])],
  controllers: [TwitterController],
  providers: [ScraperService, TweetRepository, TweetScraperJob],
  exports: [TweetScraperJob],
})
export class TwitterModule {}
