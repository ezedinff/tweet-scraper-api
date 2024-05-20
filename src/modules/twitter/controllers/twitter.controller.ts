import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../models/pagination.dto';
import { TweetRepository } from '../repositories/tweet.repository';
import { ScraperService } from '../services/scraper.service';

@Controller('twitter')
@ApiTags('Twitter')
export class TwitterController {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly scraperService: ScraperService,
  ) {}

  @Get('scrape')
  @ApiOkResponse({ description: 'Returns a list of tweets' })
  async scrapeTwitterData(@Query('username') username: string) {
    return this.scraperService.scrapeTwitterData(username);
  }

  @Get()
  @ApiOkResponse({ description: 'Returns a list of tweets' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  getTweets(@Query() pagination: PaginationQueryDto) {
    return this.tweetRepository.getTweets(pagination);
  }
}
