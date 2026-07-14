import { API_URL } from "@/lib/api";
import { assertApiUrl } from "./api-url";

export async function serverApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  assertApiUrl(API_URL);

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
    });
  } catch (error) {
    throw new Error(
      `Unable to reach backend API at ${API_URL}. Make sure the backend server is running and NEXT_PUBLIC_API_URL matches backend PORT.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
