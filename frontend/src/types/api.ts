export type ApiError = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
