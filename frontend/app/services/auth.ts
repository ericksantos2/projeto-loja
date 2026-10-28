import { api } from "~/services/api";

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  tipo: string;
  expiresIn: number;
  refreshExpiresIn: number;
  username: string;
  cargo: string;
};

const ACCESS_TOKEN_KEY = "scout_access_token";
const REFRESH_TOKEN_KEY = "scout_refresh_token";
const USERNAME_KEY = "scout_username";
const ROLE_KEY = "scout_role";

export function getAuthUsername() {
  return localStorage.getItem(USERNAME_KEY) ?? "";
}

export function getAuthRole() {
  return localStorage.getItem(ROLE_KEY) ?? "";
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAuthSession(payload: AuthTokenResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  localStorage.setItem(USERNAME_KEY, payload.username);
  localStorage.setItem(ROLE_KEY, payload.cargo);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export type UsuarioAtual = {
  username: string;
  cargo: "USER" | "GESTOR" | "ADMIN";
};

export async function fetchCurrentUser() {
  const usuario = await api.get<UsuarioAtual>("/auth/me", { requiresAuth: true });
  localStorage.setItem(USERNAME_KEY, usuario.username);
  localStorage.setItem(ROLE_KEY, usuario.cargo);
  return usuario;
}

export function isAdminOrGestor(cargo: string) {
  return cargo === "ADMIN" || cargo === "GESTOR";
}

export async function login(username: string, senha: string) {
  const payload = await api.post<AuthTokenResponse>("/auth/login", {
    username,
    senha,
  });

  saveAuthSession(payload);
  return payload;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  clearAuthSession();

  if (!refreshToken) {
    return;
  }

  try {
    await api.post<void>("/auth/logout", { refreshToken });
  } catch {
    // Ignora falha de logout no backend para manter a experiência local consistente.
  }
}
