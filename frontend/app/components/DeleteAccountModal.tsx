import { AlertCircle, Eye, EyeOff, Lock, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteAccount } from "~/services/auth";

type DeleteAccountModalProps = {
  isOpen: boolean;
  username: string;
  onClose: () => void;
  onAccountDeleted: () => void;
};

export default function DeleteAccountModal({
  isOpen,
  username,
  onClose,
  onAccountDeleted,
}: DeleteAccountModalProps) {
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSenha("");
      setShowPassword(false);
      setErrorMessage("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!senha) {
      setErrorMessage("Informe sua senha para confirmar a exclusão.");
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteAccount(senha);
      onAccountDeleted();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível excluir sua conta.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="delete-account-title" className="text-xl font-bold text-slate-950">
              Excluir minha conta
            </h2>
            <p className="text-xs text-slate-500">
              Usuário: <span className="font-semibold text-slate-700">{username}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs text-red-800 leading-relaxed">
          <p className="font-semibold">Esta ação é irreversível.</p>
          <p className="mt-1">
            Seu perfil, histórico de pedidos no carrinho e sessões ativas serão permanentemente apagados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="senha-confirmacao-exclusao"
              className="block text-xs font-semibold text-slate-700"
            >
              Digite sua senha para confirmar
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="senha-confirmacao-exclusao"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Sua senha atual"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Excluindo..." : "Excluir permanentemente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
