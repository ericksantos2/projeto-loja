const PUBLIC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:65062/api';
const INTERNAL_API_URL = typeof process !== 'undefined' ? process.env.API_INTERNAL_URL : undefined;

function getBaseUrl() {
  return (typeof window === 'undefined' ? (INTERNAL_API_URL || PUBLIC_API_URL) : PUBLIC_API_URL);
}

export function getAssetUrl(path: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const apiUrl = getBaseUrl();
  return `${apiUrl.replace(/\/api\/?$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, ...customConfig } = options;

  const headers = new Headers(customConfig.headers);
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  const response = await fetch(`${getBaseUrl()}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }),

  put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
