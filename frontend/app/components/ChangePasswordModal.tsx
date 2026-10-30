import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { changePassword } from "~/services/auth";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
};

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setShowPassword(false);
      setErrorMessage("");
      setIsSubmitting(false);
      setIsSuccess(false);
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

    if (!senhaAtual) {
      setErrorMessage("Informe sua senha atual.");
      return;
    }

    if (novaSenha.length < 8 || novaSenha.length > 24) {
      setErrorMessage("A nova senha deve ter entre 8 e 24 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErrorMessage("As senhas novas não coincidem.");
      return;
    }

    if (novaSenha === senhaAtual) {
      setErrorMessage("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(senhaAtual, novaSenha);
      // O backend revoga todas as sessões ativas após a troca de senha.
      setIsSuccess(true);
      onPasswordChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Alterar senha"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Segurança da conta</p>
              <h2 className="text-xl font-semibold text-slate-950">Alterar senha</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fechar alteração de senha"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isSuccess ? (
          <div className="space-y-5 px-5 py-6">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Senha alterada com sucesso. Por segurança, encerramos sua sessão: entre
                novamente com a nova senha.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
            <PasswordField
              id="change-current-password"
              label="Senha atual"
              value={senhaAtual}
              onChange={setSenhaAtual}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />

            <PasswordField
              id="change-new-password"
              label="Nova senha"
              value={novaSenha}
              onChange={setNovaSenha}
              placeholder="Crie uma nova senha (8 a 24 caracteres)"
              autoComplete="new-password"
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />

            <PasswordField
              id="change-confirm-password"
              label="Confirmar nova senha"
              value={confirmarSenha}
              onChange={setConfirmarSenha}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              showPassword={showPassword}
            />

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Alterando senha..." : "Alterar senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  showPassword: boolean;
  onToggleVisibility?: () => void;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  showPassword,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400 focus-within:bg-white">
        <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label={showPassword ? "Ocultar senhas" : "Mostrar senhas"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
