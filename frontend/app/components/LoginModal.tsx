import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { login, register } from "~/services/auth";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
};

type ModalMode = "login" | "register";

export default function LoginModal({ isOpen, onClose, onAuthenticated }: LoginModalProps) {
  const [mode, setMode] = useState<ModalMode>("login");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setUsername("");
      setSenha("");
      setConfirmarSenha("");
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

  const isRegister = mode === "register";

  const switchMode = (nextMode: ModalMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setSenha("");
    setConfirmarSenha("");
    setShowPassword(false);
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !senha.trim()) {
      setErrorMessage("Informe seu usuário e sua senha.");
      return;
    }

    if (isRegister) {
      if (senha.length < 8 || senha.length > 24) {
        setErrorMessage("A senha deve ter entre 8 e 24 caracteres.");
        return;
      }
      if (senha !== confirmarSenha) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(username.trim(), senha);
      } else {
        await login(username.trim(), senha);
      }
      onAuthenticated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isRegister
            ? "Não foi possível criar sua conta. Tente novamente."
            : "Não foi possível entrar no momento. Tente novamente.",
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
      aria-label={isRegister ? "Criar conta" : "Login da conta"}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Acesso da conta</p>
              <h2 className="text-xl font-semibold text-slate-950">{isRegister ? "Criar conta" : "Entrar"}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Fechar login">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 px-5 pt-3">
          {([
            { value: "login", label: "Entrar" },
            { value: "register", label: "Criar conta" },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchMode(tab.value)}
              aria-selected={mode === tab.value}
              className={
                mode === tab.value
                  ? "cursor-pointer border-b-2 border-slate-950 px-4 pb-3 text-sm font-semibold text-slate-950"
                  : "cursor-pointer border-b-2 border-transparent px-4 pb-3 text-sm font-medium text-slate-500 transition hover:text-slate-800"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <label htmlFor="login-username" className="mb-2 block text-sm font-medium text-slate-700">
              Usuário
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400 focus-within:bg-white">
              <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Digite seu usuário"
                className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400 focus-within:bg-white">
              <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "Crie uma senha (8 a 24 caracteres)" : "Digite sua senha"}
                className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label htmlFor="login-confirm-password" className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar senha
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400 focus-within:bg-white">
                <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="login-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

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
            {isSubmitting
              ? isRegister
                ? "Criando conta..."
                : "Entrando..."
              : isRegister
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
