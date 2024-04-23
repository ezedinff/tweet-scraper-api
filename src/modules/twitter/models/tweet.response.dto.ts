import { ApiProperty } from '@nestjs/swagger';
import { TweetEntity } from './tweet.entity';

export class TweetResponseDto {
  @ApiProperty({
    description: 'The username of the tweet owner',
    example: 'coindesk',
  })
  username: string;

  @ApiProperty({
    description: 'The text of the tweet',
    example: 'Bitcoin is still on fire!',
  })
  text: string;

  @ApiProperty({
    description: 'The URL of the image or null if there is no image',
    example: 'https://example.com/image.png',
    nullable: true,
  })
  image: string | null;

  static fromEntity(tweet: TweetEntity): TweetResponseDto {
    return {
      username: tweet.username,
      text: tweet.text,
      image: tweet.image,
    };
  }
}
