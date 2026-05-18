import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { IPaginatedResponse } from '@cardiq/shared-types';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  
  /**
   * Paginates a QueryBuilder result.
   */
  async paginate(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions = {},
  ): Promise<IPaginatedResponse<T>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, itemCount] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(itemCount / limit);

    return {
      data,
      meta: {
        itemCount,
        totalItems: itemCount,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  /**
   * Applies Trigram fuzzy search using pg_trgm.
   * Assumes the entity has a column configured for trigram search.
   */
  applyFuzzySearch(
    queryBuilder: SelectQueryBuilder<T>,
    column: string,
    searchTerm: string,
    threshold: number = 0.3
  ): SelectQueryBuilder<T> {
    if (!searchTerm) return queryBuilder;
    
    // Uses pg_trgm similarity function.
    queryBuilder.andWhere(`similarity(${column}, :searchTerm) > :threshold`, {
      searchTerm,
      threshold
    });
    queryBuilder.addOrderBy(`similarity(${column}, '${searchTerm}')`, 'DESC');
    
    return queryBuilder;
  }
}
