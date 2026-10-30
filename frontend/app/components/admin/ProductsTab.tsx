import { useEffect, useMemo, useState } from "react";
import { Package, Trash2, Plus, Edit2, GripVertical, Star, Loader2 } from "lucide-react";
import type { Produto } from "../../services/products";
import { getAssetUrl } from "../../services/api";

interface ProductsTabProps {
  products: Produto[];
  onAdd: () => void;
  onEdit: (product: Produto) => void;
  onDelete: (id: string) => void;
  onReorderFeatured: (ids: string[]) => Promise<void>;
}

export default function ProductsTab({
  products,
  onAdd,
  onEdit,
  onDelete,
  onReorderFeatured,
}: ProductsTabProps) {
  const destaques = useMemo(
    () =>
      products
        .filter((p) => p.featured)
        .sort((a, b) => {
          const posicaoA = a.posicaoDestaque ?? Number.MAX_SAFE_INTEGER;
          const posicaoB = b.posicaoDestaque ?? Number.MAX_SAFE_INTEGER;
          if (posicaoA !== posicaoB) return posicaoA - posicaoB;
          return a.nome.localeCompare(b.nome, "pt-BR");
        }),
    [products],
  );

  const [order, setOrder] = useState<string[]>(() => destaques.map((p) => p.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    setOrder(destaques.map((p) => p.id));
  }, [destaques]);

  const porId = useMemo(() => new Map(destaques.map((p) => [p.id, p])), [destaques]);

  const mover = async (origemId: string, destinoId: string) => {
    if (origemId === destinoId || savingOrder) return;
    const origem = order.indexOf(origemId);
    const destino = order.indexOf(destinoId);
    if (origem < 0 || destino < 0) return;

    const proxima = [...order];
    proxima.splice(origem, 1);
    proxima.splice(destino, 0, origemId);
    setOrder(proxima);

    setSavingOrder(true);
    try {
      await onReorderFeatured(proxima);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Catálogo de Produtos</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 font-medium transition-colors shadow-sm text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Cadastrar Produto
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Star className="h-4 w-4 text-amber-500" />
              Ordem dos destaques
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Arraste para definir a ordem em que os produtos aparecem no carrossel da home.
            </p>
          </div>
          {savingOrder && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
            </span>
          )}
        </div>

        {order.length === 0 ? (
          <p className="mt-3 text-xs text-gray-400">
            Nenhum produto em destaque. Marque "Exibir na área de destaques" ao editar um produto.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {order.map((id, index) => {
              const produto = porId.get(id);
              if (!produto) return null;
              const arrastando = draggingId === id;
              const alvo = dragOverId === id && draggingId !== id;

              return (
                <li
                  key={id}
                  draggable={!savingOrder}
                  onDragStart={(event) => {
                    setDraggingId(id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverId(id);
                  }}
                  onDragLeave={() => setDragOverId((atual) => (atual === id ? null : atual))}
                  onDrop={(event) => {
                    event.preventDefault();
                    const origemId = event.dataTransfer.getData("text/plain") || draggingId;
                    setDragOverId(null);
                    if (origemId) void mover(origemId, id);
                  }}
                  className={`flex items-center gap-3 rounded-lg border bg-white p-2.5 text-sm transition-colors ${
                    arrastando
                      ? "border-gray-300 opacity-50"
                      : alvo
                        ? "border-blue-400 bg-blue-50/60"
                        : "border-gray-200"
                  } ${savingOrder ? "" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {index + 1}
                  </span>
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {produto.imagemPrincipal ? (
                      <img
                        src={getAssetUrl(produto.imagemPrincipal) ?? undefined}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
                    {produto.nome}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Cards para Mobile */}
      <div className="md:hidden space-y-3">
        {products.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            Nenhum produto encontrado.
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                    {p.imagemPrincipal ? (
                      <img
                        src={getAssetUrl(p.imagemPrincipal) ?? undefined}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{p.nome}</h4>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">
                      R$ {Number(p.preco || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    (p.estoque ?? 0) < 5
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {p.estoque ?? 0} un.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => onEdit(p)}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabela para Tablet / Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Produto</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Estoque</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                      {p.imagemPrincipal ? (
                        <img
                          src={getAssetUrl(p.imagemPrincipal) ?? undefined}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>
                    {p.nome}
                  </td>
                  <td className="p-4 font-medium">R$ {Number(p.preco || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      (p.estoque ?? 0) < 5 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {p.estoque ?? 0} unidades
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
