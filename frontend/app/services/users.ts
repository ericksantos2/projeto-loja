import { api } from "./api";

export type CargoUsuario = "USER" | "GESTOR" | "ADMIN";

export interface UsuarioAdmin {
  id: number;
  username: string;
  cargo: CargoUsuario;
  ativo: boolean;
}

export interface CriarUsuarioPayload {
  username: string;
  senha: string;
  cargo: CargoUsuario;
}

export interface AtualizarUsuarioPayload {
  username: string;
  cargo: CargoUsuario;
}

export function nivelCargo(cargo: CargoUsuario): number {
  switch (cargo) {
    case "USER":
      return 0;
    case "GESTOR":
      return 1;
    case "ADMIN":
      return 2;
  }
}

export function podeGerenciarUsuario(
  operadorUsername: string,
  operadorCargo: CargoUsuario,
  alvo: UsuarioAdmin,
): boolean {
  if (!operadorUsername || alvo.username === operadorUsername) {
    return false;
  }
  return nivelCargo(alvo.cargo) < nivelCargo(operadorCargo);
}

export function cargosPermitidosParaOperador(operadorCargo: CargoUsuario): CargoUsuario[] {
  if (operadorCargo === "ADMIN") {
    return ["USER", "GESTOR"];
  }
  if (operadorCargo === "GESTOR") {
    return ["USER"];
  }
  return [];
}

export const getUsers = () =>
  api.get<UsuarioAdmin[]>("/usuarios", { requiresAuth: true });

export const getUserById = (id: number) =>
  api.get<UsuarioAdmin>(`/usuarios/${id}`, { requiresAuth: true });

export const createUser = (data: CriarUsuarioPayload) =>
  api.post<UsuarioAdmin>("/usuarios", data, { requiresAuth: true });

export const updateUser = (id: number, data: AtualizarUsuarioPayload) =>
  api.put<UsuarioAdmin>(`/usuarios/${id}`, data, { requiresAuth: true });

export const resetUserPassword = (id: number, novaSenha: string) =>
  api.patch<void>(`/usuarios/${id}/senha`, { novaSenha }, { requiresAuth: true });

export const updateUserStatus = (id: number, ativo: boolean) =>
  api.patch<void>(`/usuarios/${id}/status`, { ativo }, { requiresAuth: true });

export const deleteUser = (id: number) =>
  api.delete<void>(`/usuarios/${id}`, { requiresAuth: true });
