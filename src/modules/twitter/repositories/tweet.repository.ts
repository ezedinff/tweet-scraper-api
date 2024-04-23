import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TweetEntity } from '../models/tweet.entity';
import {
  PaginationQueryDto,
  PaginationResponseDto,
} from '../models/pagination.dto';
import { TweetResponseDto } from '../models/tweet.response.dto';
@Injectable()
export class TweetRepository extends Repository<TweetEntity> {
  constructor(dataSource: DataSource) {
    super(TweetEntity, dataSource.createEntityManager());
  }

  async getTweets(
    pagination: PaginationQueryDto,
  ): Promise<PaginationResponseDto<TweetResponseDto>> {
    const [tweets, totalCount] = await this.findAndCount({
      skip: pagination.page - 1,
      take: pagination.pageSize,
    });
    return {
      items: tweets.map((tweet) => TweetResponseDto.fromEntity(tweet)),
      totalCount,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }
}
