import { PaginationMeta } from '../interfaces/pagination.interface';

export class PaginationResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}
