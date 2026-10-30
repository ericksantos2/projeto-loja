import { createContext, useContext } from "react";
import type { Carrinho } from "~/services/cart";

export type CartContextValue = {
  carrinho: Carrinho | undefined;
  itemCount: number;
  isLoading: boolean;
  error: Error | null;
  isLoggedIn: boolean;
  isCartOpen: boolean;
  isCartClosing: boolean;
  openCart: () => void;
  closeCart: () => void;
  openLogin: () => void;
  adicionarItem: (produtoId: string, quantidade?: number) => Promise<void>;
  isAdding: (produtoId: string) => boolean;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart precisa ser usado dentro de CartProvider.");
  }
  return context;
}
