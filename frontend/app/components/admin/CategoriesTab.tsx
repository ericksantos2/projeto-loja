import { useEffect, useMemo, useState } from "react";
import { Layers, Trash2, Plus, Edit2, GripVertical, Loader2 } from "lucide-react";
import type { Categoria } from "../../services/products";
import { getAssetUrl } from "../../services/api";

interface CategoriesTabProps {
  categories: Categoria[];
  onAdd: () => void;
  onEdit: (category: Categoria) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => Promise<void>;
}

export default function CategoriesTab({
  categories,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: CategoriesTabProps) {
  const ordenadas = useMemo(() => {
    return [...categories].sort((a, b) => {
      const posicaoA = a.posicao ?? Number.MAX_SAFE_INTEGER;
      const posicaoB = b.posicao ?? Number.MAX_SAFE_INTEGER;
      if (posicaoA !== posicaoB) return posicaoA - posicaoB;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [categories]);

  const [order, setOrder] = useState<string[]>(() => ordenadas.map((c) => c.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    setOrder(ordenadas.map((c) => c.id));
  }, [ordenadas]);

  const porId = useMemo(() => new Map(ordenadas.map((c) => [c.id, c])), [ordenadas]);

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
      await onReorder(proxima);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Categorias</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            Arraste os cards para mudar a ordem de exibição na home.
            {savingOrder && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
              </>
            )}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 font-medium transition-colors shadow-sm text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {order.length === 0 && (
          <p className="text-gray-400 text-sm col-span-full">Nenhuma categoria cadastrada.</p>
        )}
        {order.map((id, index) => {
          const categoria = porId.get(id);
          if (!categoria) return null;
          const arrastando = draggingId === id;
          const alvo = dragOverId === id && draggingId !== id;

          return (
            <div
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
              className={`group flex items-center justify-between gap-2 rounded-xl border bg-gray-50 p-4 transition-colors ${
                arrastando
                  ? "border-gray-300 opacity-50"
                  : alvo
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-black"
              } ${savingOrder ? "" : "cursor-grab active:cursor-grabbing"}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-600 shadow-sm">
                  {index + 1}
                </span>
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-200">
                  {categoria.fotoUrl ? (
                    <img
                      src={getAssetUrl(categoria.fotoUrl) ?? undefined}
                      alt={categoria.nome}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <Layers className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-gray-900 text-sm sm:text-base">
                    {categoria.nome}
                  </h4>
                  {categoria.descricao && (
                    <p className="truncate text-xs text-gray-500">{categoria.descricao}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onEdit(categoria)}
                  className="p-2 text-gray-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(categoria.id)}
                  className="p-2 text-gray-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
