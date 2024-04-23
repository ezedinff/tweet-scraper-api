import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from '../services/scraper.service';
import { TweetRepository } from '../repositories/tweet.repository';
import * as crypto from 'crypto';
import { EmailService } from '../../common/services/email.service';
import { ImageService } from '../../common/services/image.service';

@Injectable()
export class TweetScraperJob {
  private readonly logger = new Logger(TweetScraperJob.name);

  constructor(
    private readonly scraperService: ScraperService,
    private readonly tweetRepository: TweetRepository,
    private readonly emailService: EmailService,
    private readonly imageService: ImageService,
  ) {}

  private generateHash(inputString: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex');
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleTweetScraping() {
    try {
      this.logger.log('Scraping tweets...');
      const tweets = await this.scraperService.scrapeTwitterData('CoinDesk');
      const filteredTweets = tweets.filter(
        (tweet) => (!!tweet.text && !!tweet.image) || !!tweet.video.length,
      );

      for (const tweet of filteredTweets) {
        const { text, image, video } = tweet;
        const tweetHash = this.generateHash(JSON.stringify(tweet));
        try {
          const existingTweet = await this.tweetRepository.findOne({
            where: { tweetHash },
          });

          if (existingTweet) {
            this.logger.warn(`Tweet already exists: ${tweetHash}`);
            continue;
          }

          const newTweet = this.tweetRepository.create({
            tweetHash,
            username: 'CoinDesk',
            text,
            image,
            videos: video,
          });

          if (video.length > 0) {
            await this.emailService.sendEmail(
              this.emailService.getVideoFoundTemplate(),
              'Tweet with video found',
            );
            this.logger.log(`Tweet with video found: ${tweetHash}`);
          }

          let photoPath = null;
          if (image) {
            photoPath = await this.imageService.save(image);
          }
          newTweet.image = photoPath;

          await newTweet.save();
        } catch (error) {
          this.logger.error(`Error saving tweet: ${error.message}`);
        }
      }

      this.logger.log('Tweets scraped successfully.');
    } catch (error) {
      this.logger.error(`Error scraping tweets: ${error.message}`);
    }
  }
}
