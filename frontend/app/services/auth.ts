import {
  clearSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredRole,
  getStoredUsername,
  onAuthChanged as onSessionAuthChanged,
  saveIdentity,
  saveSession,
  type AuthTokenResponse,
} from "./session";
import { api } from "./api";
import type { CargoUsuario } from "./users";

export interface UsuarioAtual {
  username: string;
  cargo: CargoUsuario;
}

export function getAccessToken(): string | null {
  return getStoredAccessToken();
}

export function getRefreshToken(): string | null {
  return getStoredRefreshToken();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getAuthUsername(): string {
  return getStoredUsername();
}

export function getAuthCargo(): string {
  return getStoredRole();
}

export function saveAuthSession(data: AuthTokenResponse) {
  saveSession(data);
}

export function saveAuthIdentity(username: string, cargo: string) {
  saveIdentity(username, cargo);
}

export function clearAuthSession() {
  clearSession();
}

export function onAuthChanged(callback: () => void) {
  return onSessionAuthChanged(callback);
}

export async function fetchCurrentUser() {
  const usuario = await api.get<UsuarioAtual>("/auth/me", { requiresAuth: true });
  saveAuthIdentity(usuario.username, usuario.cargo);
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

export async function deleteAccount(senha: string) {
  await api.post<void>(
    "/auth/delete-account",
    { senha },
    { requiresAuth: true },
  );
  clearAuthSession();
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
