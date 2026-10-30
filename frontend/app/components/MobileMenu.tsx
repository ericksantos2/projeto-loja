import { KeyRound, LayoutDashboard, LogOut, UserRound, X } from "lucide-react";
import { Link, NavLink } from "react-router";
import { mainNavigation } from "./navigation";
import Drawer from "./ui/Drawer";
import IconButton from "./ui/IconButton";

type MobileMenuProps = {
  isClosing: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  username?: string;
  canAccessPanel?: boolean;
  onOpenLogin?: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
};

export default function MobileMenu({
  isClosing,
  onClose,
  isLoggedIn = false,
  username = "",
  canAccessPanel = false,
  onOpenLogin,
  onOpenChangePassword,
  onLogout,
}: MobileMenuProps) {
  return (
    <div className="md:hidden">
      <Drawer
        id="mobile-navigation"
        isClosing={isClosing}
        label="Menu de navegação"
        onClose={onClose}
        side="left"
        widthClassName="w-[min(20rem,85vw)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <p className="text-lg font-semibold text-slate-950">Menu</p>
          <IconButton aria-label="Fechar menu" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        <nav aria-label="Navegação mobile" className="mt-5 flex flex-col">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-3 text-base font-medium transition ${
                  isActive
                    ? "bg-amber-50 text-slate-950 ring-1 ring-inset ring-amber-200"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-5 flex flex-col gap-1">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin?.();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
            >
              <UserRound className="h-5 w-5 text-slate-500" aria-hidden="true" />
              Entrar na conta
            </button>
          ) : (
            <>
              {username && (
                <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Conectado como {username}
                </div>
              )}
              {canAccessPanel && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  Painel Administrativo
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangePassword?.();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
              >
                <KeyRound className="h-5 w-5 text-slate-500" aria-hidden="true" />
                Alterar senha
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout?.();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair
              </button>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
