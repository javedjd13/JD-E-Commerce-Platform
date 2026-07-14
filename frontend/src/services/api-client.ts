import { ApiError } from "@/types/api";
import { assertApiUrl, getApiUrl } from "./api-url";

const API_URL = getApiUrl();

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  assertApiUrl(API_URL);

  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: options.cache,
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as
    | ApiError
    | T
    | null;

  if (!response.ok) {
    const apiError = payload as ApiError;
    throw new ApiClientError(
      apiError?.error?.message || "Something went wrong",
      response.status,
      apiError?.error?.code,
      apiError?.error?.details,
    );
  }

  return payload as T;
}
