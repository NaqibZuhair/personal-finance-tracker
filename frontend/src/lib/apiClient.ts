const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? 'API request failed');
  }

  return result as T;
}