import { ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/cn";
import { currencyFormatter } from "~/lib/formatters";
import { getAssetUrl } from "~/services/api";
import {
  useAtualizarQuantidadeCarrinho,
  useLimparCarrinho,
  useRemoverItemDoCarrinho,
} from "~/services/cart";
import { useCart } from "~/components/CartContext";
import Drawer from "./ui/Drawer";
import IconButton from "./ui/IconButton";

type CartDrawerProps = {
  isClosing: boolean;
  onClose: () => void;
  onRequestLogin: () => void;
};

export default function CartDrawer({ isClosing, onClose, onRequestLogin }: CartDrawerProps) {
  const { carrinho, isLoading, error, isLoggedIn, itemCount } = useCart();
  const atualizarQuantidade = useAtualizarQuantidadeCarrinho();
  const removerItem = useRemoverItemDoCarrinho();
  const limparCarrinho = useLimparCarrinho();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const itens = carrinho?.itens ?? [];

  const alterarQuantidade = async (produtoId: string, quantidade: number) => {
    if (quantidade < 1 || busyItemId) return;

    setActionError("");
    setBusyItemId(produtoId);
    try {
      await atualizarQuantidade.mutateAsync({ produtoId, quantidade });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a quantidade.",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const limpar = async () => {
    if (busyItemId || limparCarrinho.isPending) return;

    setActionError("");
    try {
      await limparCarrinho.mutateAsync();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Não foi possível limpar o carrinho.",
      );
    }
  };

  const remover = async (produtoId: string) => {
    if (busyItemId) return;

    setActionError("");
    setBusyItemId(produtoId);
    try {
      await removerItem.mutateAsync(produtoId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Não foi possível remover o item.",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <Drawer id="shopping-cart" isClosing={isClosing} label="Carrinho de compras" onClose={onClose} side="right" widthClassName="w-[min(24rem,100vw)]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Seu carrinho{itemCount > 0 ? ` (${itemCount})` : ""}
        </h2>
        <IconButton aria-label="Fechar carrinho" onClick={onClose}>
          <X className="h-5 w-5" aria-hidden="true" />
        </IconButton>
      </div>

      {!isLoggedIn ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-500">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">Entre para ver seu carrinho</p>
          <p className="mt-2 max-w-60 text-sm leading-6 text-slate-600">
            Sua sacola fica salva na sua conta.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={onRequestLogin}
          >
            Entrar
          </button>
        </div>
      ) : isLoading ? (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
          Carregando carrinho...
        </p>
      ) : error ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-red-500">
          Erro ao carregar o carrinho: {error.message}
        </p>
      ) : itens.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-amber-100 p-4 text-amber-700">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">Seu carrinho está vazio</p>
          <p className="mt-2 max-w-60 text-sm leading-6 text-slate-600">Adicione produtos para vê-los aqui.</p>
          <button type="button" className="mt-6 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" onClick={onClose}>
            Continuar comprando
          </button>
        </div>
      ) : (
        <>
          {itens.length > 1 && (
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={limpar}
                disabled={busyItemId !== null || limparCarrinho.isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {limparCarrinho.isPending ? "Limpando..." : "Limpar carrinho"}
              </button>
            </div>
          )}

          <ul className="flex-1 divide-y divide-slate-200 overflow-y-auto">
            {itens.map((item) => {
              const isBusy = busyItemId === item.produtoId;
              return (
                <li key={item.produtoId} className="flex gap-3 py-4">
                  <img
                    src={getAssetUrl(item.imagemPrincipal) ?? undefined}
                    alt={item.nome}
                    className="h-20 w-20 shrink-0 rounded-lg bg-slate-100 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-950">{item.nome}</p>
                      <IconButton
                        aria-label={`Remover ${item.nome} do carrinho`}
                        disabled={isBusy}
                        onClick={() => remover(item.produtoId)}
                        className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {currencyFormatter.format(item.precoUnitario)}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${item.nome}`}
                          disabled={isBusy || item.quantidade <= 1}
                          onClick={() => alterarQuantidade(item.produtoId, item.quantidade - 1)}
                          className="px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold text-slate-950">
                          {item.quantidade}
                        </span>
                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${item.nome}`}
                          disabled={isBusy}
                          onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                          className="px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>
                      <span className={cn("text-sm font-bold text-slate-950", isBusy && "opacity-50")}>
                        {currencyFormatter.format(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-slate-200 pt-5">
            {actionError && (
              <p className="mb-3 text-sm text-red-600" role="alert">
                {actionError}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Total</span>
              <span className="text-lg font-bold text-slate-950">
                {currencyFormatter.format(carrinho?.total ?? 0)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="mt-4 block w-full rounded-lg bg-amber-300 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-200"
            >
              Finalizar compra
            </Link>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onClose}
            >
              Continuar comprando
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
