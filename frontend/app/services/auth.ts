import { api } from "~/services/api";
import {
  clearSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredRole,
  getStoredUsername,
  onAuthChanged,
  saveIdentity,
  saveSession,
  type AuthTokenResponse,
} from "~/services/session";

export type { AuthTokenResponse };
export { onAuthChanged };

export function getAuthUsername() {
  return getStoredUsername();
}

export function getAuthRole() {
  return getStoredRole();
}

export function isAuthenticated() {
  return Boolean(getStoredAccessToken());
}

export function getAccessToken() {
  return getStoredAccessToken();
}

export function getRefreshToken() {
  return getStoredRefreshToken();
}

export function saveAuthSession(payload: AuthTokenResponse) {
  saveSession(payload);
}

export function clearAuthSession() {
  clearSession();
}

export type UsuarioAtual = {
  username: string;
  cargo: "USER" | "GESTOR" | "ADMIN";
};

export async function fetchCurrentUser() {
  const usuario = await api.get<UsuarioAtual>("/auth/me", { requiresAuth: true });
  saveIdentity(usuario.username, usuario.cargo);
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

export async function register(username: string, senha: string) {
  await api.post<void>("/auth/register", { username, senha });
  return login(username, senha);
}

export async function changePassword(senhaAtual: string, novaSenha: string) {
  await api.post<void>(
    "/auth/change-password",
    { senhaAtual, novaSenha },
    { requiresAuth: true },
  );
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
