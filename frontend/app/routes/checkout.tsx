import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "~/components/CartContext";
import Container from "~/components/ui/Container";
import { cn } from "~/lib/cn";
import { currencyFormatter } from "~/lib/formatters";
import { useLimparCarrinho } from "~/services/cart";

export function meta() {
  return [
    { title: "Finalizar compra | Scout Store" },
    {
      name: "description",
      content: "Revise seu pedido e conclua a compra na Scout Store.",
    },
  ];
}

const projectHighlights = [
  "Catálogo com categorias, destaques e novidades",
  "Carrinho salvo na sua conta, com quantidades e subtotais",
  "Painel administrativo para gerenciar produtos e categorias",
];

export default function Checkout() {
  const navigate = useNavigate();
  const { carrinho, isLoading, isLoggedIn, openLogin } = useCart();
  const limparCarrinho = useLimparCarrinho();
  const [errorMessage, setErrorMessage] = useState("");

  const itens = carrinho?.itens ?? [];
  const isSubmitting = limparCarrinho.isPending;

  const handleFinalizar = async () => {
    setErrorMessage("");
    try {
      await limparCarrinho.mutateAsync();
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a compra. Tente novamente.",
      );
    }
  };

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <div className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Revise seu pedido e conclua a compra.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Sobre a Scout Store
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A Scout Store é um projeto de loja completa feito para estudo e portfólio.
              O catálogo, as categorias, as variantes de cada produto e o carrinho são
              servidos por uma API em Java com Spring Boot, e a interface é construída com
              React Router e Tailwind CSS.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              Esta página é apenas uma simulação de checkout: nenhum pagamento é processado.
              Ao finalizar, o carrinho é esvaziado e você volta para a página inicial.
            </p>

            <ul className="mt-6 space-y-3">
              {projectHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Resumo do pedido
            </h2>

            {!isLoggedIn ? (
              <div className="mt-6 flex flex-col items-start gap-4">
                <p className="text-sm leading-6 text-slate-600">
                  Entre na sua conta para ver os itens do seu carrinho.
                </p>
                <button
                  type="button"
                  onClick={openLogin}
                  className="cursor-pointer rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Entrar
                </button>
              </div>
            ) : isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Carregando carrinho...</p>
            ) : itens.length === 0 ? (
              <div className="mt-6 flex flex-col items-start gap-4">
                <div className="rounded-full bg-amber-100 p-4 text-amber-700">
                  <ShoppingBag className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Seu carrinho está vazio. Adicione produtos para finalizar uma compra.
                </p>
                <Link
                  to="/produtos"
                  className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ver produtos
                </Link>
              </div>
            ) : (
              <>
                <ul className="mt-5 divide-y divide-slate-200">
                  {itens.map((item) => (
                    <li key={item.produtoId} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{item.nome}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.quantidade} x {currencyFormatter.format(item.precoUnitario)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-slate-950">
                        {currencyFormatter.format(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <span>Total</span>
                  <span className="text-lg font-bold text-slate-950">
                    {currencyFormatter.format(carrinho?.total ?? 0)}
                  </span>
                </div>

                {errorMessage && (
                  <p className="mt-4 text-sm text-red-600" role="alert">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleFinalizar}
                  disabled={isSubmitting}
                  className={cn(
                    "mt-5 w-full cursor-pointer rounded-lg bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200",
                    "disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500",
                  )}
                >
                  {isSubmitting ? "Finalizando..." : "Finalizar compra"}
                </button>
                <Link
                  to="/produtos"
                  className="mt-3 block w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Continuar comprando
                </Link>
              </>
            )}
          </aside>
        </div>
      </Container>
    </main>
  );
}
