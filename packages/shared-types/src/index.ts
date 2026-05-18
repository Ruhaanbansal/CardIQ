export * from './enums';
export * from './entities';

export interface IPaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}
