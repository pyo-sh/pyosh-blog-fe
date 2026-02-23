export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class ApiResponseError extends Error {
  statusCode: number;

  constructor(error: ApiError) {
    super(error.message);
    this.statusCode = error.statusCode;
    this.name = "ApiResponseError";
  }
}
