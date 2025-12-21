import {
  PaginationParams,
  PaginationMeta,
  PaginatedResult,
} from '../interfaces/pagination.interface';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export class PaginationUtil {
  /**
   * Calculate pagination parameters
   */
  static getPaginationParams(query: PaginationQueryDto): PaginationParams {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder || 'desc',
    };
  }

  /**
   * Create pagination metadata
   */
  static createMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Create paginated result
   */
  static createPaginatedResult<T>(
    data: T[],
    total: number,
    params: PaginationParams,
  ): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(total, params.page, params.limit),
    };
  }
}
