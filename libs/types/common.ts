export interface Response<T> {
  success: boolean;
  status: string;
  status_code: number;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
