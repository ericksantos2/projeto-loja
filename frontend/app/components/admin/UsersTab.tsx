import { useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  cargosPermitidosParaOperador,
  podeGerenciarUsuario,
  type AtualizarUsuarioPayload,
  type CargoUsuario,
  type CriarUsuarioPayload,
  type UsuarioAdmin,
} from "../../services/users";

interface UsersTabProps {
  users: UsuarioAdmin[];
  currentUsername: string;
  currentRole: CargoUsuario;
  onCreateUser: (data: CriarUsuarioPayload) => Promise<void>;
  onUpdateUser: (id: number, data: AtualizarUsuarioPayload) => Promise<void>;
  onResetPassword: (id: number, novaSenha: string) => Promise<void>;
  onToggleStatus: (user: UsuarioAdmin) => Promise<void>;
  onDeleteUser: (user: UsuarioAdmin) => Promise<void>;
}

const CARGO_LABELS: Record<CargoUsuario, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  USER: "Usuário",
};

const CARGO_BADGE_CLASSES: Record<CargoUsuario, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  GESTOR: "bg-blue-50 text-blue-700 border-blue-200",
  USER: "bg-gray-100 text-gray-700 border-gray-200",
};

function extrairMensagem(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function UsersTab({
  users,
  currentUsername,
  currentRole,
  onCreateUser,
  onUpdateUser,
  onResetPassword,
  onToggleStatus,
  onDeleteUser,
}: UsersTabProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | CargoUsuario>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Estado de carregamento por linha (status / exclusão)
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  // Modal Criar / Editar Usuário
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioAdmin | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formCargo, setFormCargo] = useState<CargoUsuario>("USER");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Modal Redefinir Senha
  const [resetTarget, setResetTarget] = useState<UsuarioAdmin | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Modal Confirmar Exclusão
  const [deleteTarget, setDeleteTarget] = useState<UsuarioAdmin | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const cargosDisponiveis = useMemo(
    () => cargosPermitidosParaOperador(currentRole),
    [currentRole],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      if (query && !u.username.toLowerCase().includes(query)) return false;
      if (roleFilter !== "ALL" && u.cargo !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.ativo) return false;
      if (statusFilter === "INACTIVE" && u.ativo) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername("");
    setFormPassword("");
    setFormCargo("USER");
    setShowFormPassword(false);
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: UsuarioAdmin) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword("");
    setFormCargo(user.cargo);
    setShowFormPassword(false);
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    if (isSavingUser) return;
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserFormError("");
  };

  const handleSaveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setUserFormError("");

    const usernameLimpo = formUsername.trim();
    if (!usernameLimpo) {
      setUserFormError("Informe um nome de usuário válido.");
      return;
    }

    if (!editingUser && (formPassword.length < 8 || formPassword.length > 24)) {
      setUserFormError("A senha deve ter entre 8 e 24 caracteres.");
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, {
          username: usernameLimpo,
          cargo: formCargo,
        });
      } else {
        await onCreateUser({
          username: usernameLimpo,
          senha: formPassword,
          cargo: formCargo,
        });
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setUserFormError(extrairMensagem(err, "Não foi possível salvar o usuário."));
    } finally {
      setIsSavingUser(false);
    }
  };

  const openResetModal = (user: UsuarioAdmin) => {
    setResetTarget(user);
    setNovaSenha("");
    setConfirmarSenha("");
    setShowResetPassword(false);
    setResetError("");
  };

  const closeResetModal = () => {
    if (isResetting) return;
    setResetTarget(null);
    setResetError("");
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    setResetError("");

    if (novaSenha.length < 8 || novaSenha.length > 24) {
      setResetError("A nova senha deve ter entre 8 e 24 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setResetError("As senhas não coincidem.");
      return;
    }

    setIsResetting(true);
    try {
      await onResetPassword(resetTarget.id, novaSenha);
      setResetTarget(null);
    } catch (err) {
      setResetError(extrairMensagem(err, "Erro ao redefinir a senha."));
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleUserStatus = async (user: UsuarioAdmin) => {
    setBusyUserId(user.id);
    try {
      await onToggleStatus(user);
    } finally {
      setBusyUserId(null);
    }
  };

  const openDeleteModal = (user: UsuarioAdmin) => {
    if (user.ativo) return;
    setDeleteTarget(user);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      await onDeleteUser(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(extrairMensagem(err, "Erro ao excluir usuário."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="mt-1 text-xs text-gray-500">
            {currentRole === "ADMIN"
              ? "Como Administrador, você pode gerenciar contas de Gestores e Usuários comuns."
              : "Como Gestor, você pode gerenciar contas de Usuários comuns."}
          </p>
        </div>
        {cargosDisponiveis.length > 0 && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 font-medium transition-colors shadow-sm text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {/* Aviso de regra de exclusão e hierarquia */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-3 text-xs text-amber-800 flex items-start gap-2.5">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-semibold">Regras de segurança:</span> Você só pode editar,
          redefinir a senha, desativar ou excluir usuários abaixo do seu nível na hierarquia. Para{" "}
          <span className="font-semibold">excluir</span> uma conta, é obrigatório{" "}
          <span className="font-semibold">desativá-la primeiro</span>.
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome de usuário..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-black outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2.5 sm:gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "ALL" | CargoUsuario)}
            aria-label="Filtrar por cargo"
            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-700 focus:bg-white focus:border-black outline-none"
          >
            <option value="ALL">Todos os cargos</option>
            <option value="ADMIN">Administrador</option>
            <option value="GESTOR">Gestor</option>
            <option value="USER">Usuário</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            aria-label="Filtrar por status"
            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-700 focus:bg-white focus:border-black outline-none"
          >
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Desativados</option>
          </select>
        </div>
      </div>

      {/* Cards de Usuários para Mobile */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            Nenhum usuário encontrado.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isSelf = u.username === currentUsername;
            const canManage = podeGerenciarUsuario(currentUsername, currentRole, u);
            const isBusy = busyUserId === u.id;

            return (
              <div
                key={u.id}
                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                  u.ativo
                    ? "border-gray-200 bg-white"
                    : "border-gray-200 bg-gray-50/70 text-gray-500"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                        u.ativo ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-400"
                      }`}
                    >
                      <UserRound className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-semibold text-sm truncate ${
                            u.ativo ? "text-gray-900" : "line-through text-gray-500"
                          }`}
                        >
                          {u.username}
                        </span>
                        {isSelf && (
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Você
                          </span>
                        )}
                      </div>
                      <span
                        className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${CARGO_BADGE_CLASSES[u.cargo]}`}
                      >
                        {CARGO_LABELS[u.cargo]} ({u.cargo})
                      </span>
                    </div>
                  </div>

                  {u.ativo ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ativo
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <Ban className="w-3.5 h-3.5" />
                      Desativado
                    </span>
                  )}
                </div>

                {!canManage ? (
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 italic text-center">
                    {isSelf ? "Sua conta" : "Hierarquia protegida"}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openResetModal(u)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Resetar senha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleToggleUserStatus(u)}
                      disabled={isBusy}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                        u.ativo
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.ativo ? (
                        <Ban className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{u.ativo ? "Desativar" : "Ativar"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(u)}
                      disabled={u.ativo || isBusy}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium rounded-lg transition-colors ${
                        u.ativo
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                      }`}
                      title={
                        u.ativo
                          ? "Desative o usuário antes de excluí-lo"
                          : `Excluir permanentemente ${u.username}`
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tabela de Usuários para Tablet / Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Usuário</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.username === currentUsername;
                const canManage = podeGerenciarUsuario(currentUsername, currentRole, u);
                const isBusy = busyUserId === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      u.ativo ? "hover:bg-gray-50/80" : "bg-gray-50/60 text-gray-500"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            u.ativo
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-50 text-red-400"
                          }`}
                        >
                          <UserRound className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={u.ativo ? "text-gray-900" : "line-through text-gray-500"}>
                            {u.username}
                          </span>
                          {isSelf && (
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Você
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CARGO_BADGE_CLASSES[u.cargo]}`}
                      >
                        {CARGO_LABELS[u.cargo]} ({u.cargo})
                      </span>
                    </td>

                    <td className="p-4">
                      {u.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <Ban className="w-3.5 h-3.5" />
                          Desativado
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {!canManage ? (
                        <span className="text-xs text-gray-400 italic">
                          {isSelf ? "Sua conta" : "Hierarquia protegida"}
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Editar usuário / cargo */}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Editar usuário ou cargo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Redefinir senha */}
                          <button
                            type="button"
                            onClick={() => openResetModal(u)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title={`Redefinir senha de ${u.username}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Resetar senha</span>
                          </button>

                          {/* Ativar / Desativar */}
                          <button
                            type="button"
                            onClick={() => void handleToggleUserStatus(u)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                              u.ativo
                                ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                            title={u.ativo ? "Desativar conta" : "Reativar conta"}
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : u.ativo ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            <span>{u.ativo ? "Desativar" : "Ativar"}</span>
                          </button>

                          {/* Excluir (somente se desativado) */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(u)}
                            disabled={u.ativo || isBusy}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              u.ativo
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                : "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                            }`}
                            title={
                              u.ativo
                                ? "Desative o usuário antes de excluí-lo"
                                : `Excluir permanentemente ${u.username}`
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar / Editar Usuário */}
      {isUserModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={editingUser ? "Editar usuário" : "Novo usuário"}
          onClick={closeUserModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-800">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Ex.: joao.silva"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Senha inicial (8 a 24 caracteres)
                  </label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-black">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <input
                      type={showFormPassword ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={24}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Digite uma senha de 8 a 24 caracteres"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword((prev) => !prev)}
                      className="p-1 text-gray-400 hover:text-gray-700"
                      aria-label={showFormPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showFormPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Cargo
                </label>
                <select
                  value={formCargo}
                  onChange={(e) => setFormCargo(e.target.value as CargoUsuario)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                >
                  {cargosDisponiveis.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {CARGO_LABELS[cargo]} ({cargo})
                    </option>
                  ))}
                </select>
              </div>

              {userFormError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{userFormError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeUserModal}
                  disabled={isSavingUser}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingUser ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Redefinir Senha */}
      {resetTarget && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Redefinir senha do usuário"
          onClick={closeResetModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Redefinir Senha</h3>
                  <p className="text-xs text-gray-500">
                    Usuário: <span className="font-semibold text-gray-800">{resetTarget.username}</span> (
                    {CARGO_LABELS[resetTarget.cargo]})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeResetModal}
                className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nova senha
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-black">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={24}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Nova senha (8 a 24 caracteres)"
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                    aria-label={showResetPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showResetPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmar nova senha
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-black">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={24}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-transparent py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              {resetError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeResetModal}
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? "Redefinindo..." : "Salvar Nova Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão de usuário"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Usuário</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir permanentemente o usuário{" "}
              <span className="font-semibold text-gray-900">{deleteTarget.username}</span>? Esta
              ação removerá a conta e seu carrinho e não poderá ser desfeita.
            </p>

            {deleteError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
