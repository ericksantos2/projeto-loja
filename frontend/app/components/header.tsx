import { Menu, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import CartDrawer from "./CartDrawer";
import MobileMenu from "./MobileMenu";
import { mainNavigation } from "./navigation";
import IconButton from "./ui/IconButton";
import Container from "./ui/Container";

type PanelState = "closed" | "menu" | "cart" | "closing-menu" | "closing-cart";

export default function Header() {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const isMenuOpen = panelState === "menu";
  const isCartOpen = panelState === "cart";

  const closePanel = () => {
    if (panelState === "menu") setPanelState("closing-menu");
    if (panelState === "cart") setPanelState("closing-cart");
  };

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
            <Link
              key={item.to}
              to={item.to}
              className="group relative text-sm font-medium text-slate-600 transition hover:text-slate-950 lg:text-base"
            >
              {item.label}
              <span
                className="absolute -bottom-1 left-0 h-0.5 w-0 bg-amber-400 transition-all duration-300 group-hover:w-full"
                aria-hidden="true"
              />
            </Link>
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
