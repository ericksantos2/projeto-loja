import {
  clearSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  notifyAuthToast,
  saveSession,
  type AuthTokenResponse,
} from "./session";

const PUBLIC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:65062/api';
const INTERNAL_API_URL = typeof process !== 'undefined' ? process.env.API_INTERNAL_URL : undefined;

function getBaseUrl() {
  return typeof window === 'undefined' ? INTERNAL_API_URL || PUBLIC_API_URL : PUBLIC_API_URL;
}

export function getAssetUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;

  // Usa a URL base do backend (porta 65062) diretamente
  const baseUrl = 'http://localhost:65062';

  // Garante que o caminho comece com /
  const formattedPath = path.startsWith('/') ? path : `/${path}`;

  // Caminhos já públicos (ex.: /api/imagens/foto.jpg) são usados como estão.
  // Nomes de arquivo crus (uploads antigos) viram /api/imagens/<arquivo>.
  return formattedPath.startsWith('/api')
    ? `${baseUrl}${formattedPath}`
    : `${baseUrl}/api/imagens${formattedPath}`;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Renova o par de tokens usando o refresh token salvo. Chamadas concorrentes
 * compartilham a mesma requisição para evitar rotações simultâneas (o backend
 * rotaciona o refresh token e detecta reuso).
 */
function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const payload = (await response.json()) as AuthTokenResponse;

        // Se a sessão foi encerrada (logout/troca de senha) durante a renovação,
        // descarta o resultado para não ressuscitar os tokens antigos.
        if (getStoredRefreshToken() !== refreshToken) return null;

        saveSession(payload);
        return payload.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, ...customConfig } = options;

  const buildConfig = (accessToken: string | null): RequestInit => {
    const headers = new Headers(customConfig.headers);

    if (!(customConfig.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (requiresAuth && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return { ...customConfig, headers };
  };

  const requestUrl = `${getBaseUrl()}${endpoint}`;

  let response = await fetch(
    requestUrl,
    buildConfig(requiresAuth ? getStoredAccessToken() : null),
  );

  // Access token expirado: renova uma única vez e repete a requisição.
  if (response.status === 401 && requiresAuth) {
    const initialError = await response.clone().json().catch(() => ({}));
    const refreshTokenUsado = getStoredRefreshToken();
    const novoAccessToken = await refreshAccessToken();

    if (novoAccessToken) {
      response = await fetch(requestUrl, buildConfig(novoAccessToken));
    } else {
      // Só limpa a sessão se ela ainda é a que falhou na renovação.
      if (!refreshTokenUsado || getStoredRefreshToken() === refreshTokenUsado) {
        clearSession();
      }
      const initialMessage =
        typeof initialError?.message === 'string' ? initialError.message : '';
      if (initialMessage.toLowerCase().includes('desativad')) {
        notifyAuthToast(initialMessage);
        throw new Error(initialMessage);
      }
      throw new Error('Sua sessão expirou. Entre novamente.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Ocorreu um erro na requisição.';
    if (typeof message === 'string' && message.toLowerCase().includes('desativad')) {
      notifyAuthToast(message);
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.text();
  if (!body) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  postForm: <T>(endpoint: string, data: FormData, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: data }),

  putForm: <T>(endpoint: string, data: FormData, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: data }),

  patchForm: <T>(endpoint: string, data: FormData, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body: data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
