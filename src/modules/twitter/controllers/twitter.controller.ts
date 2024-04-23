import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../models/pagination.dto';
import { TweetRepository } from '../repositories/tweet.repository';

@Controller('twitter')
@ApiTags('Twitter')
export class TwitterController {
  constructor(private readonly tweetRepository: TweetRepository) {}

  @Get()
  @ApiOkResponse({ description: 'Returns a list of tweets' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  getTweets(@Query() pagination: PaginationQueryDto) {
    return this.tweetRepository.getTweets(pagination);
  }
}
