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

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`[API Client Non-JSON Response for ${path}]:`, text.slice(0, 200));
    throw new Error('⚠️ Koneksi ke server API gagal (respons bukan JSON). Pastikan server backend aktif atau coba refresh halaman.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? 'API request failed');
  }

  return result as T;
}