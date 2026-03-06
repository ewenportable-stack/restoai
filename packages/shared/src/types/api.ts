export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
