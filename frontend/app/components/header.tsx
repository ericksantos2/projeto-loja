import { LayoutDashboard, LogOut, Menu, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import {
  clearAuthSession,
  fetchCurrentUser,
  getAuthUsername,
  isAdminOrGestor,
  isAuthenticated,
  logout,
} from "~/services/auth";
import CartDrawer from "./CartDrawer";
import LoginModal from "./LoginModal";
import MobileMenu from "./MobileMenu";
import { mainNavigation } from "./navigation";
import IconButton from "./ui/IconButton";
import Container from "./ui/Container";

type PanelState = "closed" | "menu" | "cart" | "closing-menu" | "closing-cart";

export default function Header() {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [canAccessPanel, setCanAccessPanel] = useState(false);
  const isMenuOpen = panelState === "menu";
  const isCartOpen = panelState === "cart";

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
    if (panelState === "cart") setPanelState("closing-cart");
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  useEffect(() => {
    if (!panelState.startsWith("closing")) return;

    const timeoutId = window.setTimeout(() => setPanelState("closed"), 200);
    return () => window.clearTimeout(timeoutId);
  }, [panelState]);

  return (
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
          <IconButton
            aria-label={
              isCartOpen
                ? "Fechar carrinho de compras"
                : "Abrir carrinho de compras"
            }
            aria-expanded={isCartOpen}
            aria-controls="shopping-cart"
            onClick={() => setPanelState(isCartOpen ? "closing-cart" : "cart")}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
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
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  updateAuthState();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 md:px-4"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{username || "Conta"}</span>
              </button>
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
        </div>
      </Container>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthenticated={() => {
          updateAuthState();
          setIsLoginOpen(false);
        }}
      />

      {(panelState === "menu" || panelState === "closing-menu") && (
        <MobileMenu
          isClosing={panelState === "closing-menu"}
          onClose={closePanel}
        />
      )}
      {(panelState === "cart" || panelState === "closing-cart") && (
        <CartDrawer
          isClosing={panelState === "closing-cart"}
          onClose={closePanel}
        />
      )}
    </header>
  );
}
