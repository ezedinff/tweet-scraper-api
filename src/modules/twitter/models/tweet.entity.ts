import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tweets')
export class TweetEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', unique: true })
  tweetHash: string;
  @Column('text')
  username: string;
  @Column('text')
  text: string;
  @Column('text', { nullable: true })
  image: string | null;
  @Column('jsonb', { nullable: true })
  videos: string[] | null;
}
