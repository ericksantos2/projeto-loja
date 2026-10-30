import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, onAuthChanged } from "~/services/auth";
import { onAuthToast } from "~/services/session";
import {
  carrinhoQueryKey,
  useAdicionarAoCarrinho,
  useCarrinhoQuery,
} from "~/services/cart";
import CartDrawer from "./CartDrawer";
import { CartContext, type CartContextValue } from "./CartContext";
import LoginModal from "./LoginModal";

type NoticeState = {
  message: string;
  type: "info" | "error";
};

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartClosing, setIsCartClosing] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const carrinhoQuery = useCarrinhoQuery(isLoggedIn);
  const adicionarMutation = useAdicionarAoCarrinho();

  useEffect(() => {
    const sync = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (!authenticated) {
        queryClient.removeQueries({ queryKey: carrinhoQueryKey });
        setIsCartOpen(false);
        setIsCartClosing(false);
      }
    };

    sync();
    return onAuthChanged(sync);
  }, [queryClient]);

  useEffect(() => {
    return onAuthToast((message) => {
      setNotice({ message, type: "error" });
    });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    if (!isCartClosing) return;
    const timeoutId = window.setTimeout(() => {
      setIsCartOpen(false);
      setIsCartClosing(false);
    }, 200);
    return () => window.clearTimeout(timeoutId);
  }, [isCartClosing]);

  const openCart = useCallback(() => {
    setIsCartClosing(false);
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setIsCartClosing(true), []);

  const adicionarItem = useCallback(
    async (produtoId: string, quantidade = 1) => {
      if (!isAuthenticated()) {
        setIsLoginOpen(true);
        return;
      }

      setAddingProductId(produtoId);
      try {
        await adicionarMutation.mutateAsync({ produtoId, quantidade });
        setNotice({ message: "Produto adicionado ao carrinho.", type: "info" });
        openCart();
      } catch (error) {
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível adicionar o produto ao carrinho.",
          type: "error",
        });
      } finally {
        setAddingProductId(null);
      }
    },
    [adicionarMutation, openCart],
  );

  const itemCount = useMemo(
    () => carrinhoQuery.data?.itens.reduce((total, item) => total + item.quantidade, 0) ?? 0,
    [carrinhoQuery.data],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      carrinho: carrinhoQuery.data,
      itemCount,
      isLoading: carrinhoQuery.isLoading,
      error: carrinhoQuery.error,
      isLoggedIn,
      isCartOpen,
      isCartClosing,
      openCart,
      closeCart,
      openLogin: () => setIsLoginOpen(true),
      adicionarItem,
      isAdding: (produtoId: string) => addingProductId === produtoId,
    }),
    [
      addingProductId,
      adicionarItem,
      carrinhoQuery.data,
      carrinhoQuery.error,
      carrinhoQuery.isLoading,
      closeCart,
      isCartClosing,
      isCartOpen,
      isLoggedIn,
      itemCount,
      openCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}

      {(isCartOpen || isCartClosing) && (
        <CartDrawer
          isClosing={isCartClosing}
          onClose={closeCart}
          onRequestLogin={() => {
            closeCart();
            setIsLoginOpen(true);
          }}
        />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthenticated={() => {
          setIsLoginOpen(false);
          queryClient.invalidateQueries({ queryKey: carrinhoQueryKey });
        }}
      />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 left-1/2 z-[80] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-xl ${
            notice.type === "error" ? "bg-red-600" : "bg-slate-950"
          }`}
        >
          {notice.message}
        </div>
      )}
    </CartContext.Provider>
  );
}
