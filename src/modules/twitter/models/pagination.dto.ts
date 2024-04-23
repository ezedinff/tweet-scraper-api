import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({ example: 1, description: 'Current page number', default: 1 })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page', default: 10 })
  pageSize: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({
    type: () => [PaginationResponseDto['items'][0]],
    description: 'Paginated items',
  })
  items: T[];

  @ApiProperty({ example: 100, description: 'Total count of items' })
  totalCount: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  pageSize: number;
}
