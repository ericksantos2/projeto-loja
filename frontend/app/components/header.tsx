import { KeyRound, LayoutDashboard, LogOut, Menu, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import {
  clearAuthSession,
  fetchCurrentUser,
  getAuthUsername,
  isAdminOrGestor,
  isAuthenticated,
  logout,
  onAuthChanged,
} from "~/services/auth";
import { useCart } from "~/components/CartContext";
import ChangePasswordModal from "./ChangePasswordModal";
import MobileMenu from "./MobileMenu";
import { mainNavigation } from "./navigation";
import IconButton from "./ui/IconButton";
import Container from "./ui/Container";

type PanelState = "closed" | "menu" | "closing-menu";

export default function Header() {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [canAccessPanel, setCanAccessPanel] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isMenuOpen = panelState === "menu";
  const { isCartOpen, openCart, closeCart, openLogin, itemCount } = useCart();

  const updateAuthState = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    setUsername(getAuthUsername());
    setCanAccessPanel(false);

    if (!authenticated) return;

    fetchCurrentUser()
      .then((usuario) => {
        setUsername(usuario.username);
        setCanAccessPanel(isAdminOrGestor(usuario.cargo));
      })
      .catch(() => {
        clearAuthSession();
        setIsLoggedIn(false);
        setUsername("");
      });
  };

  const closePanel = () => {
    if (panelState === "menu") setPanelState("closing-menu");
  };

  useEffect(() => {
    updateAuthState();
    return onAuthChanged(updateAuthState);
  }, []);

  useEffect(() => {
    if (!panelState.startsWith("closing")) return;

    const timeoutId = window.setTimeout(() => setPanelState("closed"), 200);
    return () => window.clearTimeout(timeoutId);
  }, [panelState]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen]);

  return (
    <>
    <header className="border-b border-slate-200 bg-white">
      <Container className="relative flex h-16 items-center justify-between md:h-18 lg:h-20">
        <Link to="/" aria-label="Ir para a página inicial da Scout Store">
          <img
            src="/brand/scout-logo.svg"
            alt="Scout Store"
            className="h-9 w-auto md:h-10"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex lg:gap-9"
        >
          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group relative text-sm font-medium transition lg:text-base ${
                  isActive
                    ? "text-slate-950"
                    : "text-slate-600 hover:text-slate-950"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-amber-400 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 md:px-4"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          ) : (
            <>
              {canAccessPanel && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:px-4"
                  title="Ir para o painel administrativo"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Painel</span>
                </Link>
              )}
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 md:px-4"
                  title="Opções da conta"
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{username || "Conta"}</span>
                </button>
                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Opções da conta"
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      Alterar senha
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setIsAccountMenuOpen(false);
                        await logout();
                        updateAuthState();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <IconButton
            className="md:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setPanelState(isMenuOpen ? "closing-menu" : "menu")}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </IconButton>
          <div className="relative">
            <IconButton
              aria-label={
                isCartOpen
                  ? "Fechar carrinho de compras"
                  : "Abrir carrinho de compras"
              }
              aria-expanded={isCartOpen}
              aria-controls="shopping-cart"
              onClick={() => (isCartOpen ? closeCart() : openCart())}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            {itemCount > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
        </div>
      </Container>

      {(panelState === "menu" || panelState === "closing-menu") && (
        <MobileMenu
          isClosing={panelState === "closing-menu"}
          onClose={closePanel}
          isLoggedIn={isLoggedIn}
          username={username}
          canAccessPanel={canAccessPanel}
          onOpenLogin={openLogin}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={async () => {
            await logout();
            updateAuthState();
          }}
        />
      )}
    </header>

    <ChangePasswordModal
      isOpen={isChangePasswordOpen}
      onClose={() => setIsChangePasswordOpen(false)}
      onPasswordChanged={clearAuthSession}
    />
    </>
  );
}
