import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  addProductImages,
  replaceProductImage,
  deleteProductImage,
  reorderProductImages,
  createProductSpecification,
  updateProductSpecification,
  deleteProductSpecification,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  reorderProductSpecifications,
  reorderProductVariants,
  updateProductHighlights,
  type Categoria,
  type EspecificacaoDTO,
  type ImagemDTO,
  type Produto,
  type ProdutoPayload,
  type VarianteDTO,
} from "../../services/products";
import { getAssetUrl } from "../../services/api";

export interface TaskResult {
  ok: number;
  failures: { label: string; message: string }[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Produto | null;
  categories: Categoria[];
  onFinished: (result: TaskResult) => void;
}

type FieldsPayload = Partial<
  Pick<ProdutoPayload, "nome" | "descricao" | "preco" | "estoque" | "categoryId" | "featured">
>;

type PendingChange =
  | { kind: "fields"; id: string; label: string; payload: FieldsPayload }
  | { kind: "add-image"; id: string; label: string; file: File }
  | { kind: "replace-image"; id: string; label: string; imagemId: string; file: File }
  | { kind: "remove-image"; id: string; label: string; imagemId: string }
  | { kind: "reorder"; id: string; label: string; imagemIds: string[] }
  | { kind: "highlights"; id: string; label: string; highlights: string[] }
  | {
      kind: "add-spec";
      id: string;
      label: string;
      rowKey: string;
      payload: { label: string; value: string };
    }
  | {
      kind: "update-spec";
      id: string;
      label: string;
      especificacaoId: string;
      payload: { label: string; value: string };
    }
  | { kind: "remove-spec"; id: string; label: string; especificacaoId: string }
  | {
      kind: "add-variant";
      id: string;
      label: string;
      rowKey: string;
      payload: { label: string; value: string; available: boolean };
    }
  | {
      kind: "update-variant";
      id: string;
      label: string;
      varianteId: string;
      payload: { label: string; value: string; available: boolean };
    }
  | { kind: "remove-variant"; id: string; label: string; varianteId: string }
  | { kind: "reorder-spec"; id: string; label: string; rowKeys: string[] }
  | { kind: "reorder-variant"; id: string; label: string; rowKeys: string[] }
  | {
      kind: "cover";
      id: string;
      label: string;
      targetUrl?: string;
      addChangeId?: string;
    };

interface TaskState {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  message?: string;
}

type CoverChoice =
  | { type: "existing"; imagemUrl: string }
  | { type: "new"; file: File }
  | null;

interface Snapshot {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoryId: string;
  featured: boolean;
  imagemPrincipal: string | null;
  highlights: string[];
  imagens: ImagemDTO[];
  especificacoes: EspecificacaoDTO[];
  variantes: VarianteDTO[];
}

interface SpecRow {
  key: string;
  id?: string;
  label: string;
  value: string;
}

interface VariantRow {
  key: string;
  id?: string;
  label: string;
  value: string;
  available: boolean;
}

function novaLinhaKey() {
  return `nova-${Math.random().toString(36).slice(2)}`;
}

function moveKey<Row extends { key: string }>(
  order: string[],
  rows: Row[],
  sourceKey: string,
  targetKey: string,
  after: boolean,
): string[] {
  const base = orderRows(rows, order).map((row) => row.key);
  const from = base.indexOf(sourceKey);
  if (from === -1 || sourceKey === targetKey) return order;

  const next = [...base];
  next.splice(from, 1);
  const targetIndex = next.indexOf(targetKey);
  if (targetIndex === -1) return order;

  next.splice(after ? targetIndex + 1 : targetIndex, 0, sourceKey);
  return next;
}

function orderRows<Row extends { key: string }>(rows: Row[], order: string[]): Row[] {
  const ordenadas: Row[] = [];
  order.forEach((key) => {
    const row = rows.find((item) => item.key === key);
    if (row) ordenadas.push(row);
  });
  rows.forEach((row) => {
    if (!ordenadas.some((item) => item.key === row.key)) ordenadas.push(row);
  });
  return ordenadas;
}

interface ExecutionRuntime {
  uploadedUrls: Map<string, string>;
  specIds: Map<string, string>;
  variantIds: Map<string, string>;
}

function snapshotFrom(product: Produto | null | undefined): Snapshot {
  return {
    nome: product?.nome ?? "",
    descricao: product?.descricao ?? "",
    preco: product?.preco ?? 0,
    estoque: product?.estoque ?? 0,
    categoryId: product?.categoryId ?? product?.categoriaId ?? "",
    featured: Boolean(product?.featured),
    imagemPrincipal: product?.imagemPrincipal ?? null,
    highlights: product?.highlights ?? [],
    imagens: product?.imagens ?? [],
    especificacoes: product?.especificacoes ?? [],
    variantes: product?.variantes ?? [],
  };
}

function orderImages(imagens: ImagemDTO[], imagemOrder: string[]): ImagemDTO[] {
  const ordenadas: ImagemDTO[] = [];
  imagemOrder.forEach((imagemId) => {
    const imagem = imagens.find((item) => item.imagemId === imagemId);
    if (imagem) ordenadas.push(imagem);
  });
  imagens.forEach((imagem) => {
    if (!ordenadas.some((item) => item.imagemId === imagem.imagemId)) ordenadas.push(imagem);
  });
  return ordenadas;
}

function mensagemErro(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function ProductModal({
  isOpen,
  onClose,
  initialData,
  categories,
  onFinished,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    categoriaId: "",
    featured: false,
  });
  const [snapshot, setSnapshot] = useState<Snapshot>(() => snapshotFrom(initialData));
  const [added, setAdded] = useState<File[]>([]);
  const [replacements, setReplacements] = useState<Record<string, File>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [coverChoice, setCoverChoice] = useState<CoverChoice>(null);
  const [highlightRows, setHighlightRows] = useState<{ key: string; value: string }[]>([]);
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [specOrder, setSpecOrder] = useState<string[]>([]);
  const [variantOrder, setVariantOrder] = useState<string[]>([]);
  const [imageOrder, setImageOrder] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingSpec, setDraggingSpec] = useState<string | null>(null);
  const [dragOverSpec, setDragOverSpec] = useState<string | null>(null);
  const [draggingVariant, setDraggingVariant] = useState<string | null>(null);
  const [dragOverVariant, setDragOverVariant] = useState<string | null>(null);
  const [draggingHighlight, setDraggingHighlight] = useState<string | null>(null);
  const [dragOverHighlight, setDragOverHighlight] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [taskStates, setTaskStates] = useState<TaskState[] | null>(null);

  useEffect(() => {
    setFormData({
      nome: initialData?.nome ?? "",
      descricao: initialData?.descricao ?? "",
      preco: initialData ? String(initialData.preco ?? "") : "",
      estoque: initialData ? String(initialData.estoque ?? "") : "",
      categoriaId: initialData?.categoryId ?? initialData?.categoriaId ?? "",
      featured: Boolean(initialData?.featured),
    });
    setSnapshot(snapshotFrom(initialData));
    setAdded([]);
    setReplacements({});
    setRemovedIds([]);
    setCoverChoice(null);
    setHighlightRows(
      (initialData?.highlights ?? []).map((value) => ({ key: novaLinhaKey(), value })),
    );
    setSpecRows(
      (initialData?.especificacoes ?? []).map((item) => ({
        key: item.id,
        id: item.id,
        label: item.label,
        value: item.value,
      })),
    );
    setVariantRows(
      (initialData?.variantes ?? []).map((item) => ({
        key: item.id,
        id: item.id,
        label: item.label,
        value: item.value,
        available: Boolean(item.available),
      })),
    );
    setImageOrder((initialData?.imagens ?? []).map((imagem) => imagem.imagemId));
    setSpecOrder((initialData?.especificacoes ?? []).map((item) => item.id));
    setVariantOrder((initialData?.variantes ?? []).map((item) => item.id));
    setDraggingId(null);
    setDragOverId(null);
    setDraggingSpec(null);
    setDragOverSpec(null);
    setDraggingVariant(null);
    setDragOverVariant(null);
    setDraggingHighlight(null);
    setDragOverHighlight(null);
    setRunning(false);
    setTaskStates(null);
  }, [initialData, isOpen]);

  const isEditing = Boolean(initialData);

  const changes = useMemo<PendingChange[]>(() => {
    if (!initialData) return [];

    const list: PendingChange[] = [];
    const nome = formData.nome.trim();
    const descricao = formData.descricao.trim();
    const preco = Number.parseFloat(formData.preco);
    const estoque = Number.parseInt(formData.estoque, 10);

    // Campos vão em um único PATCH; só as imagens viram requests separadas.
    const camposAlterados: string[] = [];
    const camposPayload: FieldsPayload = {};

    if (nome !== snapshot.nome) {
      camposAlterados.push("nome");
      camposPayload.nome = nome;
    }
    if (descricao !== snapshot.descricao.trim()) {
      camposAlterados.push("descrição");
      camposPayload.descricao = descricao;
    }
    if (Number.isFinite(preco) && preco !== snapshot.preco) {
      camposAlterados.push("preço");
      camposPayload.preco = preco;
    }
    if (Number.isFinite(estoque) && estoque !== snapshot.estoque) {
      camposAlterados.push("estoque");
      camposPayload.estoque = estoque;
    }
    if (formData.categoriaId !== snapshot.categoryId) {
      camposAlterados.push("categoria");
      camposPayload.categoryId = formData.categoriaId;
    }
    if (formData.featured !== snapshot.featured) {
      camposAlterados.push("destaque");
      camposPayload.featured = formData.featured;
    }

    if (camposAlterados.length > 0) {
      list.push({
        kind: "fields",
        id: "fields",
        label: `Atualizar dados (${camposAlterados.join(", ")})`,
        payload: camposPayload,
      });
    }

    // Highlights
    const highlights = highlightRows.map((row) => row.value.trim()).filter(Boolean);
    const highlightsOriginais = snapshot.highlights.map((item) => item.trim()).filter(Boolean);
    if (highlights.join("\n") !== highlightsOriginais.join("\n")) {
      list.push({
        kind: "highlights",
        id: "highlights",
        label: `Atualizar destaques (${highlights.length})`,
        highlights,
      });
    }

    // Especificações
    const specIdsAtuais = new Set(specRows.filter((row) => row.id).map((row) => row.id));
    const specRowsOrdenadas = orderRows(specRows, specOrder);
    specRowsOrdenadas.forEach((row) => {
      const label = row.label.trim();
      const value = row.value.trim();
      if (!label || !value) return;

      if (!row.id) {
        list.push({
          kind: "add-spec",
          id: `add-spec-${row.key}`,
          rowKey: row.key,
          label: `Adicionar especificação "${label}"`,
          payload: { label, value },
        });
        return;
      }

      const original = snapshot.especificacoes.find((item) => item.id === row.id);
      if (original && (original.label !== label || original.value !== value)) {
        list.push({
          kind: "update-spec",
          id: `update-spec-${row.id}`,
          label: `Editar especificação "${label}"`,
          especificacaoId: row.id,
          payload: { label, value },
        });
      }
    });
    snapshot.especificacoes.forEach((item) => {
      if (!specIdsAtuais.has(item.id)) {
        list.push({
          kind: "remove-spec",
          id: `remove-spec-${item.id}`,
          label: `Remover especificação "${item.label}"`,
          especificacaoId: item.id,
        });
      }
    });

    const specKeysExistentes = snapshot.especificacoes
      .filter((item) => specIdsAtuais.has(item.id))
      .map((item) => specRows.find((row) => row.id === item.id)?.key)
      .filter((key): key is string => Boolean(key));
    const specKeysNovas = specRowsOrdenadas.filter((row) => !row.id).map((row) => row.key);
    const specOrdemDesejada = specOrder.filter((key) =>
      specRows.some((row) => row.key === key),
    );
    const specOrdemBase = [...specKeysExistentes, ...specKeysNovas];

    if (
      specOrdemDesejada.length > 1 &&
      specOrdemDesejada.join("|") !== specOrdemBase.join("|")
    ) {
      list.push({
        kind: "reorder-spec",
        id: "reorder-spec",
        label: `Reordenar especificações (${specOrdemDesejada.length})`,
        rowKeys: specOrdemDesejada,
      });
    }

    // Variantes
    const varianteIdsAtuais = new Set(
      variantRows.filter((row) => row.id).map((row) => row.id),
    );
    const variantRowsOrdenadas = orderRows(variantRows, variantOrder);
    variantRowsOrdenadas.forEach((row) => {
      const label = row.label.trim();
      const value = row.value.trim();
      if (!label || !value) return;

      if (!row.id) {
        list.push({
          kind: "add-variant",
          id: `add-variant-${row.key}`,
          rowKey: row.key,
          label: `Adicionar variante "${label}: ${value}"`,
          payload: { label, value, available: row.available },
        });
        return;
      }

      const original = snapshot.variantes.find((item) => item.id === row.id);
      if (
        original &&
        (original.label !== label ||
          original.value !== value ||
          Boolean(original.available) !== row.available)
      ) {
        list.push({
          kind: "update-variant",
          id: `update-variant-${row.id}`,
          label: `Editar variante "${label}: ${value}"`,
          varianteId: row.id,
          payload: { label, value, available: row.available },
        });
      }
    });
    snapshot.variantes.forEach((item) => {
      if (!varianteIdsAtuais.has(item.id)) {
        list.push({
          kind: "remove-variant",
          id: `remove-variant-${item.id}`,
          label: `Remover variante "${item.label}: ${item.value}"`,
          varianteId: item.id,
        });
      }
    });

    const varianteKeysExistentes = snapshot.variantes
      .filter((item) => varianteIdsAtuais.has(item.id))
      .map((item) => variantRows.find((row) => row.id === item.id)?.key)
      .filter((key): key is string => Boolean(key));
    const varianteKeysNovas = variantRowsOrdenadas
      .filter((row) => !row.id)
      .map((row) => row.key);
    const varianteOrdemDesejada = variantOrder.filter((key) =>
      variantRows.some((row) => row.key === key),
    );
    const varianteOrdemBase = [...varianteKeysExistentes, ...varianteKeysNovas];

    if (
      varianteOrdemDesejada.length > 1 &&
      varianteOrdemDesejada.join("|") !== varianteOrdemBase.join("|")
    ) {
      list.push({
        kind: "reorder-variant",
        id: "reorder-variant",
        label: `Reordenar variantes (${varianteOrdemDesejada.length})`,
        rowKeys: varianteOrdemDesejada,
      });
    }

    const addChanges: PendingChange[] = added.map((file, index) => ({
      kind: "add-image",
      id: `add-${index}`,
      label: `Adicionar imagem "${file.name}"`,
      file,
    }));
    list.push(...addChanges);

    // Ordem atual na tela, incluindo possíveis IDs que já saíram do snapshot.
    const ordenadas = orderImages(snapshot.imagens, imageOrder);

    ordenadas
      .filter((imagem) => !removedIds.includes(imagem.imagemId) && replacements[imagem.imagemId])
      .forEach((imagem, index) => {
        list.push({
          kind: "replace-image",
          id: `replace-${imagem.imagemId}`,
          label: `Trocar imagem ${index + 1} ("${imagem.imagemUrl.split("/").pop()}")`,
          imagemId: imagem.imagemId,
          file: replacements[imagem.imagemId],
        });
      });

    removedIds
      .filter((imagemId) => snapshot.imagens.some((imagem) => imagem.imagemId === imagemId))
      .forEach((imagemId) => {
        const index = ordenadas.findIndex((imagem) => imagem.imagemId === imagemId);
        list.push({
          kind: "remove-image",
          id: `remove-${imagemId}`,
          label: `Remover imagem ${index + 1}`,
          imagemId,
        });
      });

    const ordemDesejada = ordenadas
      .map((imagem) => imagem.imagemId)
      .filter((imagemId) => !removedIds.includes(imagemId));
    const ordemAtual = snapshot.imagens
      .map((imagem) => imagem.imagemId)
      .filter((imagemId) => !removedIds.includes(imagemId));

    if (ordemDesejada.length > 1 && ordemDesejada.join("|") !== ordemAtual.join("|")) {
      list.push({
        kind: "reorder",
        id: "reorder",
        label: `Reordenar imagens (${ordemDesejada.length})`,
        imagemIds: ordemDesejada,
      });
    }

    if (coverChoice?.type === "existing" && coverChoice.imagemUrl !== snapshot.imagemPrincipal) {
      list.push({
        kind: "cover",
        id: "cover",
        label: "Definir imagem de capa",
        targetUrl: coverChoice.imagemUrl,
      });
    } else if (coverChoice?.type === "new") {
      const addChange = addChanges.find(
        (change) => change.kind === "add-image" && change.file === coverChoice.file,
      );
      if (addChange) {
        list.push({
          kind: "cover",
          id: "cover",
          label: "Definir imagem de capa (nova imagem)",
          addChangeId: addChange.id,
        });
      }
    }

    return list;
  }, [
    added,
    coverChoice,
    formData,
    highlightRows,
    imageOrder,
    initialData,
    removedIds,
    replacements,
    snapshot,
    specOrder,
    specRows,
    variantOrder,
    variantRows,
  ]);

  if (!isOpen) return null;

  const orderedImages = orderImages(snapshot.imagens, imageOrder);
  const orderedSpecRows = orderRows(specRows, specOrder);
  const orderedVariantRows = orderRows(variantRows, variantOrder);

  const updateSpecRow = (key: string, patch: Partial<SpecRow>) => {
    setSpecRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const updateVariantRow = (key: string, patch: Partial<VariantRow>) => {
    setVariantRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const moveHighlight = (origemKey: string, destinoKey: string) => {
    if (origemKey === destinoKey) return;
    setHighlightRows((rows) => {
      const origem = rows.findIndex((row) => row.key === origemKey);
      const destino = rows.findIndex((row) => row.key === destinoKey);
      if (origem < 0 || destino < 0) return rows;

      const proxima = [...rows];
      const [item] = proxima.splice(origem, 1);
      proxima.splice(destino, 0, item);
      return proxima;
    });
  };

  const addHighlightRow = () => {
    setHighlightRows((rows) => [...rows, { key: novaLinhaKey(), value: "" }]);
  };

  const addSpecRow = () => {
    const key = novaLinhaKey();
    setSpecRows((rows) => [...rows, { key, label: "", value: "" }]);
    setSpecOrder((order) => [...order, key]);
  };

  const addVariantRow = () => {
    const key = novaLinhaKey();
    setVariantRows((rows) => [...rows, { key, label: "", value: "", available: true }]);
    setVariantOrder((order) => [...order, key]);
  };

  const removeSpecRow = (key: string) => {
    setSpecRows((rows) => rows.filter((row) => row.key !== key));
    setSpecOrder((order) => order.filter((item) => item !== key));
  };

  const removeVariantRow = (key: string) => {
    setVariantRows((rows) => rows.filter((row) => row.key !== key));
    setVariantOrder((order) => order.filter((item) => item !== key));
  };

  const moveSpec = (sourceKey: string, targetKey: string, after: boolean) => {
    setSpecOrder((order) => moveKey(order, specRows, sourceKey, targetKey, after));
  };

  const moveVariant = (sourceKey: string, targetKey: string, after: boolean) => {
    setVariantOrder((order) => moveKey(order, variantRows, sourceKey, targetKey, after));
  };

  const specIncompleta = (row: SpecRow) => {
    const temAlgo = Boolean(row.label.trim() || row.value.trim());
    return temAlgo && (!row.label.trim() || !row.value.trim());
  };

  const varianteIncompleta = (row: VariantRow) => {
    const temAlgo = Boolean(row.label.trim() || row.value.trim());
    return temAlgo && (!row.label.trim() || !row.value.trim());
  };

  const moveImage = (sourceId: string, targetId: string, after: boolean) => {
    setImageOrder((current) => {
      const base = orderImages(snapshot.imagens, current).map((imagem) => imagem.imagemId);
      const from = base.indexOf(sourceId);
      if (from === -1 || sourceId === targetId) return current;

      const next = [...base];
      next.splice(from, 1);
      const targetIndex = next.indexOf(targetId);
      if (targetIndex === -1) return current;

      next.splice(after ? targetIndex + 1 : targetIndex, 0, sourceId);
      return next;
    });
  };

  const effectiveCover =
    coverChoice?.type === "existing"
      ? coverChoice.imagemUrl
      : coverChoice?.type === "new"
        ? null
        : snapshot.imagemPrincipal;

  const toggleRemoved = (imagemId: string) => {
    setRemovedIds((current) =>
      current.includes(imagemId)
        ? current.filter((id) => id !== imagemId)
        : [...current, imagemId],
    );
    setReplacements((current) => {
      if (!current[imagemId]) return current;
      const next = { ...current };
      delete next[imagemId];
      return next;
    });
    const imagem = snapshot.imagens.find((item) => item.imagemId === imagemId);
    if (imagem && coverChoice?.type === "existing" && coverChoice.imagemUrl === imagem.imagemUrl) {
      setCoverChoice(null);
    }
  };

  const replaceImage = (imagemId: string, file: File | null) => {
    const imagem = snapshot.imagens.find((item) => item.imagemId === imagemId);
    if (imagem && coverChoice?.type === "existing" && coverChoice.imagemUrl === imagem.imagemUrl) {
      setCoverChoice(null);
    }
    setReplacements((current) => {
      const next = { ...current };
      if (file) next[imagemId] = file;
      else delete next[imagemId];
      return next;
    });
  };

  const removeAdded = (file: File) => {
    setAdded((current) => current.filter((item) => item !== file));
    if (coverChoice?.type === "new" && coverChoice.file === file) setCoverChoice(null);
  };

  const markTask = (index: number, patch: Partial<TaskState>) => {
    setTaskStates((current) =>
      current ? current.map((task, idx) => (idx === index ? { ...task, ...patch } : task)) : current,
    );
  };

  const executeChange = async (
    produtoId: string,
    change: PendingChange,
    runtime: ExecutionRuntime,
  ) => {
    switch (change.kind) {
      case "fields":
        await updateProduct(produtoId, change.payload);
        setSnapshot((current) => ({ ...current, ...change.payload }));
        break;
      case "highlights": {
        const atualizados = await updateProductHighlights(produtoId, change.highlights);
        setSnapshot((current) => ({ ...current, highlights: atualizados }));
        break;
      }
      case "add-spec": {
        const criada = await createProductSpecification(produtoId, change.payload);
        runtime.specIds.set(change.rowKey, criada.id);
        setSnapshot((current) => ({
          ...current,
          especificacoes: [...current.especificacoes, criada],
        }));
        setSpecRows((rows) =>
          rows.map((row) =>
            row.key === change.rowKey
              ? { ...row, id: criada.id, label: criada.label, value: criada.value }
              : row,
          ),
        );
        break;
      }
      case "update-spec": {
        const atualizada = await updateProductSpecification(
          produtoId,
          change.especificacaoId,
          change.payload,
        );
        setSnapshot((current) => ({
          ...current,
          especificacoes: current.especificacoes.map((item) =>
            item.id === change.especificacaoId ? atualizada : item,
          ),
        }));
        break;
      }
      case "remove-spec":
        await deleteProductSpecification(produtoId, change.especificacaoId);
        setSnapshot((current) => ({
          ...current,
          especificacoes: current.especificacoes.filter(
            (item) => item.id !== change.especificacaoId,
          ),
        }));
        break;
      case "add-variant": {
        const criada = await createProductVariant(produtoId, change.payload);
        runtime.variantIds.set(change.rowKey, criada.id);
        setSnapshot((current) => ({
          ...current,
          variantes: [...current.variantes, criada],
        }));
        setVariantRows((rows) =>
          rows.map((row) =>
            row.key === change.rowKey
              ? {
                  ...row,
                  id: criada.id,
                  label: criada.label,
                  value: criada.value,
                  available: Boolean(criada.available),
                }
              : row,
          ),
        );
        break;
      }
      case "update-variant": {
        const atualizada = await updateProductVariant(
          produtoId,
          change.varianteId,
          change.payload,
        );
        setSnapshot((current) => ({
          ...current,
          variantes: current.variantes.map((item) =>
            item.id === change.varianteId ? atualizada : item,
          ),
        }));
        break;
      }
      case "remove-variant":
        await deleteProductVariant(produtoId, change.varianteId);
        setSnapshot((current) => ({
          ...current,
          variantes: current.variantes.filter((item) => item.id !== change.varianteId),
        }));
        break;
      case "reorder-spec": {
        const ids = change.rowKeys
          .map((key) => specRows.find((row) => row.key === key)?.id ?? runtime.specIds.get(key))
          .filter((id): id is string => Boolean(id));
        if (ids.length === 0) break;
        const atualizadas = await reorderProductSpecifications(produtoId, ids);
        setSnapshot((current) => ({ ...current, especificacoes: atualizadas }));
        break;
      }
      case "reorder-variant": {
        const ids = change.rowKeys
          .map(
            (key) => variantRows.find((row) => row.key === key)?.id ?? runtime.variantIds.get(key),
          )
          .filter((id): id is string => Boolean(id));
        if (ids.length === 0) break;
        const atualizadas = await reorderProductVariants(produtoId, ids);
        setSnapshot((current) => ({ ...current, variantes: atualizadas }));
        break;
      }
      case "add-image": {
        const [criada] = await addProductImages(produtoId, [change.file]);
        if (!criada) throw new Error("O servidor não retornou a imagem criada.");
        runtime.uploadedUrls.set(change.id, criada.imagemUrl);
        setSnapshot((current) => ({
          ...current,
          imagens: [...current.imagens, criada],
          imagemPrincipal: current.imagemPrincipal ?? criada.imagemUrl,
        }));
        setImageOrder((current) =>
          current.includes(criada.imagemId) ? current : [...current, criada.imagemId],
        );
        setAdded((current) => current.filter((file) => file !== change.file));
        setCoverChoice((current) =>
          current?.type === "new" && current.file === change.file
            ? { type: "existing", imagemUrl: criada.imagemUrl }
            : current,
        );
        break;
      }
      case "replace-image": {
        const atualizada = await replaceProductImage(produtoId, change.imagemId, change.file);
        setSnapshot((current) => ({
          ...current,
          imagens: current.imagens.map((imagem) =>
            imagem.imagemId === change.imagemId ? atualizada : imagem,
          ),
          imagemPrincipal:
            current.imagemPrincipal ===
            current.imagens.find((imagem) => imagem.imagemId === change.imagemId)?.imagemUrl
              ? atualizada.imagemUrl
              : current.imagemPrincipal,
        }));
        setReplacements((current) => {
          const next = { ...current };
          delete next[change.imagemId];
          return next;
        });
        break;
      }
      case "remove-image":
        await deleteProductImage(produtoId, change.imagemId);
        setSnapshot((current) => {
          const restantes = current.imagens.filter((imagem) => imagem.imagemId !== change.imagemId);
          const removida = current.imagens.find((imagem) => imagem.imagemId === change.imagemId);
          return {
            ...current,
            imagens: restantes,
            imagemPrincipal:
              removida && removida.imagemUrl === current.imagemPrincipal
                ? restantes[0]?.imagemUrl ?? null
                : current.imagemPrincipal,
          };
        });
        setRemovedIds((current) => current.filter((id) => id !== change.imagemId));
        setImageOrder((current) => current.filter((id) => id !== change.imagemId));
        break;
      case "reorder": {
        const atualizadas = await reorderProductImages(produtoId, change.imagemIds);
        setSnapshot((current) => ({ ...current, imagens: atualizadas }));
        setImageOrder(atualizadas.map((imagem) => imagem.imagemId));
        break;
      }
      case "cover": {
        const url = change.targetUrl ?? runtime.uploadedUrls.get(change.addChangeId ?? "");
        if (!url) {
          throw new Error("A imagem escolhida como capa não foi enviada (a tarefa de adicionar falhou).");
        }
        await updateProduct(produtoId, { imagemPrincipal: url });
        setSnapshot((current) => ({ ...current, imagemPrincipal: url }));
        setCoverChoice(null);
        break;
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (running) return;

    const nome = formData.nome.trim();
    const preco = Number.parseFloat(formData.preco);
    const estoque = Number.parseInt(formData.estoque, 10);

    if (!nome) {
      onFinished({ ok: 0, failures: [{ label: "Validar formulário", message: "Informe o nome do produto." }] });
      return;
    }
    if (!Number.isFinite(preco) || preco < 0) {
      onFinished({ ok: 0, failures: [{ label: "Validar formulário", message: "Informe um preço válido." }] });
      return;
    }
    if (!Number.isFinite(estoque) || estoque < 0) {
      onFinished({ ok: 0, failures: [{ label: "Validar formulário", message: "Informe um estoque válido." }] });
      return;
    }
    if (specRows.some(specIncompleta)) {
      onFinished({
        ok: 0,
        failures: [
          { label: "Validar formulário", message: "Preencha label e valor de todas as especificações." },
        ],
      });
      return;
    }
    if (variantRows.some(varianteIncompleta)) {
      onFinished({
        ok: 0,
        failures: [
          { label: "Validar formulário", message: "Preencha label e valor de todas as variantes." },
        ],
      });
      return;
    }

    setRunning(true);
    setTaskStates(null);

    if (!initialData) {
      const payload: ProdutoPayload = {
        nome,
        descricao: formData.descricao.trim(),
        preco,
        estoque,
        featured: formData.featured,
        ...(formData.categoriaId ? { categoryId: formData.categoriaId } : {}),
        highlights: highlightRows.map((row) => row.value.trim()).filter(Boolean),
        especificacoes: specRows
          .filter((row) => row.label.trim() && row.value.trim())
          .map((row) => ({ label: row.label.trim(), value: row.value.trim() })),
        variantes: variantRows
          .filter((row) => row.label.trim() && row.value.trim())
          .map((row) => ({
            label: row.label.trim(),
            value: row.value.trim(),
            available: row.available,
          })),
      };

      try {
        await createProduct(payload, added);
        setRunning(false);
        onFinished({ ok: 1, failures: [] });
      } catch (err) {
        setRunning(false);
        onFinished({
          ok: 0,
          failures: [{ label: "Criar produto", message: mensagemErro(err, "Erro ao criar produto.") }],
        });
      }
      return;
    }

    if (changes.length === 0) {
      setRunning(false);
      onFinished({ ok: 0, failures: [] });
      return;
    }

    setTaskStates(changes.map((change) => ({ id: change.id, label: change.label, status: "pending" })));
    const runtime: ExecutionRuntime = {
      uploadedUrls: new Map<string, string>(),
      specIds: new Map(
        specRows.filter((row) => row.id).map((row) => [row.key, row.id as string]),
      ),
      variantIds: new Map(
        variantRows.filter((row) => row.id).map((row) => [row.key, row.id as string]),
      ),
    };
    const failures: { label: string; message: string }[] = [];
    let ok = 0;

    for (let index = 0; index < changes.length; index++) {
      const change = changes[index];
      markTask(index, { status: "running" });
      try {
        await executeChange(initialData.id, change, runtime);
        ok += 1;
        markTask(index, { status: "success" });
      } catch (err) {
        const message = mensagemErro(err, "Falha ao executar a tarefa.");
        failures.push({ label: change.label, message });
        markTask(index, { status: "error", message });
      }
    }

    setRunning(false);
    onFinished({ ok, failures });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !running) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="w-full min-w-0 space-y-4 overflow-y-auto overscroll-contain p-6">
        <div className="flex justify-between items-center pb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Produto" : "Cadastrar Produto"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Produto</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estoque</label>
              <input
                type="number"
                min="0"
                required
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
            <select
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all appearance-none"
            >
              <option value="">Sem categoria</option>
              {categories.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-black"
            />
            Exibir no carrossel de destaques da home
          </label>

          {/* Destaques do produto */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Destaques</p>
              <button
                type="button"
                onClick={addHighlightRow}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Adicionar
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Frases curtas usadas como diferenciais na página do produto.
            </p>
            {highlightRows.length > 1 && (
              <p className="text-xs text-gray-400">Arraste para reordenar.</p>
            )}
            {highlightRows.length === 0 && (
              <p className="text-xs text-gray-400">Nenhum destaque cadastrado.</p>
            )}
            <div className="space-y-2">
              {highlightRows.map((row) => (
                <div
                  key={row.key}
                  draggable={!running}
                  onDragStart={(event) => {
                    setDraggingHighlight(row.key);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", row.key);
                  }}
                  onDragEnd={() => {
                    setDraggingHighlight(null);
                    setDragOverHighlight(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverHighlight(row.key);
                  }}
                  onDragLeave={() =>
                    setDragOverHighlight((atual) => (atual === row.key ? null : atual))
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    const origemKey = event.dataTransfer.getData("text/plain") || draggingHighlight;
                    setDragOverHighlight(null);
                    if (origemKey) moveHighlight(origemKey, row.key);
                  }}
                  className={`flex items-center gap-2 rounded-lg border p-1.5 transition-colors ${
                    draggingHighlight === row.key
                      ? "border-gray-300 opacity-50"
                      : dragOverHighlight === row.key && draggingHighlight !== row.key
                        ? "border-blue-400 bg-blue-50/60"
                        : "border-transparent"
                  } ${running ? "" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    value={row.value}
                    onChange={(event) =>
                      setHighlightRows((rows) =>
                        rows.map((item) =>
                          item.key === row.key ? { ...item, value: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Ex.: Cancelamento ativo de ruído"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setHighlightRows((rows) => rows.filter((item) => item.key !== row.key))
                    }
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remover destaque"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Especificações */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Especificações</p>
              <button
                type="button"
                onClick={addSpecRow}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Adicionar
              </button>
            </div>
            {specRows.length === 0 && (
              <p className="text-xs text-gray-400">Nenhuma especificação cadastrada.</p>
            )}
            {orderedSpecRows.length > 1 && (
              <p className="text-xs text-gray-400">Arraste para reordenar.</p>
            )}
            <div className="space-y-2">
              {orderedSpecRows.map((row) => (
                <div
                  key={row.key}
                  draggable={!running}
                  onDragStart={(event) => {
                    if (running) return;
                    setDraggingSpec(row.key);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", row.key);
                  }}
                  onDragOver={(event) => {
                    if (!draggingSpec || draggingSpec === row.key) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverSpec(row.key);
                  }}
                  onDragLeave={() =>
                    setDragOverSpec((current) => (current === row.key ? null : current))
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggingSpec) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    moveSpec(draggingSpec, row.key, event.clientY > rect.top + rect.height / 2);
                    setDraggingSpec(null);
                    setDragOverSpec(null);
                  }}
                  onDragEnd={() => {
                    setDraggingSpec(null);
                    setDragOverSpec(null);
                  }}
                  className={`flex items-center gap-2 rounded-lg ${
                    draggingSpec === row.key ? "opacity-40" : ""
                  } ${dragOverSpec === row.key ? "ring-2 ring-blue-400" : ""}`}
                >
                  <span
                    className="shrink-0 cursor-grab text-gray-300"
                    title="Arraste para reordenar"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <input
                    value={row.label}
                    onChange={(event) => updateSpecRow(row.key, { label: event.target.value })}
                    placeholder="Label (ex.: Cor)"
                    className="w-2/5 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                  />
                  <input
                    value={row.value}
                    onChange={(event) => updateSpecRow(row.key, { value: event.target.value })}
                    placeholder="Valor (ex.: Preto)"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(row.key)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remover especificação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variantes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Variantes</p>
              <button
                type="button"
                onClick={addVariantRow}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Adicionar
              </button>
            </div>
            {variantRows.length === 0 && (
              <p className="text-xs text-gray-400">Nenhuma variante cadastrada.</p>
            )}
            {orderedVariantRows.length > 1 && (
              <p className="text-xs text-gray-400">Arraste para reordenar.</p>
            )}
            <div className="space-y-2">
              {orderedVariantRows.map((row) => (
                <div
                  key={row.key}
                  draggable={!running}
                  onDragStart={(event) => {
                    if (running) return;
                    setDraggingVariant(row.key);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", row.key);
                  }}
                  onDragOver={(event) => {
                    if (!draggingVariant || draggingVariant === row.key) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverVariant(row.key);
                  }}
                  onDragLeave={() =>
                    setDragOverVariant((current) => (current === row.key ? null : current))
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggingVariant) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    moveVariant(
                      draggingVariant,
                      row.key,
                      event.clientY > rect.top + rect.height / 2,
                    );
                    setDraggingVariant(null);
                    setDragOverVariant(null);
                  }}
                  onDragEnd={() => {
                    setDraggingVariant(null);
                    setDragOverVariant(null);
                  }}
                  className={`flex items-center gap-2 rounded-lg ${
                    draggingVariant === row.key ? "opacity-40" : ""
                  } ${dragOverVariant === row.key ? "ring-2 ring-blue-400" : ""}`}
                >
                  <span
                    className="shrink-0 cursor-grab text-gray-300"
                    title="Arraste para reordenar"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <input
                    value={row.label}
                    onChange={(event) => updateVariantRow(row.key, { label: event.target.value })}
                    placeholder="Label (ex.: Tamanho)"
                    className="w-1/4 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                  />
                  <input
                    value={row.value}
                    onChange={(event) => updateVariantRow(row.key, { value: event.target.value })}
                    placeholder="Valor (ex.: M)"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                  />
                  <label className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={row.available}
                      onChange={(event) =>
                        updateVariantRow(row.key, { available: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-black"
                    />
                    Disponível
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVariantRow(row.key)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remover variante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Imagens existentes */}
          {isEditing && orderedImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-700">Imagens do produto</p>
                {orderedImages.length > 1 && (
                  <p className="text-xs text-gray-400">Arraste para mudar a ordem da galeria</p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orderedImages.map((imagem, index) => {
                  const removida = removedIds.includes(imagem.imagemId);
                  const nova = replacements[imagem.imagemId];
                  const capa = effectiveCover === imagem.imagemUrl;
                  const arrastando = draggingId === imagem.imagemId;
                  const alvo = dragOverId === imagem.imagemId;

                  return (
                    <div
                      key={imagem.imagemId}
                      draggable={!removida && !running}
                      onDragStart={(event) => {
                        if (removida || running) return;
                        setDraggingId(imagem.imagemId);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", imagem.imagemId);
                      }}
                      onDragOver={(event) => {
                        if (!draggingId || removida) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setDragOverId(imagem.imagemId);
                      }}
                      onDragLeave={() => {
                        setDragOverId((current) =>
                          current === imagem.imagemId ? null : current,
                        );
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!draggingId || removida) return;
                        const rect = event.currentTarget.getBoundingClientRect();
                        const depois = event.clientX > rect.left + rect.width / 2;
                        moveImage(draggingId, imagem.imagemId, depois);
                        setDraggingId(null);
                        setDragOverId(null);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverId(null);
                      }}
                      className={`rounded-xl border p-2 space-y-2 transition-shadow ${
                        removida
                          ? "border-red-200 bg-red-50/50 opacity-60"
                          : "border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing"
                      } ${arrastando ? "opacity-40" : ""} ${alvo ? "ring-2 ring-blue-400" : ""}`}
                    >
                      <div className="relative">
                        {nova ? (
                          <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-amber-300 bg-white text-amber-600">
                            <Upload className="h-5 w-5" />
                          </div>
                        ) : (
                          <img
                            src={getAssetUrl(imagem.imagemUrl) ?? undefined}
                            alt={`Imagem ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover bg-white"
                          />
                        )}
                        {capa && (
                          <span className="absolute left-1 top-1 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                            CAPA
                          </span>
                        )}
                        {!removida && !running && (
                          <span
                            className="absolute right-1 top-1 rounded bg-white/90 p-1 text-gray-400"
                            title="Arraste para reordenar"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      {nova && (
                        <p className="text-xs text-amber-700 truncate" title={nova.name}>
                          Nova: {nova.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCoverChoice(
                              capa
                                ? null
                                : { type: "existing", imagemUrl: imagem.imagemUrl },
                            )
                          }
                          disabled={removida}
                          className={`p-1.5 rounded-lg transition-colors ${capa ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:bg-white hover:text-amber-600"}`}
                          title="Definir como capa"
                        >
                          <Star className="h-4 w-4" fill={capa ? "currentColor" : "none"} />
                        </button>

                        <label
                          className={`p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-blue-600 ${removida ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                          title="Trocar imagem"
                        >
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => replaceImage(imagem.imagemId, e.target.files?.[0] ?? null)}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => toggleRemoved(imagem.imagemId)}
                          className={`p-1.5 rounded-lg transition-colors ${removida ? "text-red-600 bg-red-100" : "text-gray-400 hover:bg-white hover:text-red-600"}`}
                          title={removida ? "Desfazer remoção" : "Remover imagem"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Novas imagens selecionadas */}
          {added.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Imagens a adicionar</p>
              <div className="space-y-2">
                {added.map((file) => {
                  const capa = coverChoice?.type === "new" && coverChoice.file === file;
                  return (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <span className="truncate text-xs text-gray-600" title={file.name}>{file.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCoverChoice(capa ? null : { type: "new", file })}
                          className={`p-1.5 rounded-lg ${capa ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:bg-white hover:text-amber-600"}`}
                          title="Definir como capa"
                        >
                          <Star className="h-4 w-4" fill={capa ? "currentColor" : "none"} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAdded(file)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-red-600"
                          title="Remover da lista"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <ImagePlus className="w-4 h-4" /> Adicionar imagens
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length > 0) setAdded((current) => [...current, ...files]);
                e.target.value = "";
              }}
              className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-800 hover:file:bg-gray-200"
            />
            <p className="mt-1 text-xs text-gray-400">
              A primeira imagem enviada vira capa se o produto ainda não tiver uma.
            </p>
          </div>

          {/* Prévia da fila de tarefas */}
          {isEditing && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Alterações pendentes ({changes.length})
              </p>
              {changes.length === 0 ? (
                <p className="mt-1 text-xs text-gray-400">Nenhuma alteração no formulário.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {changes.map((change) => (
                    <li key={change.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {change.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Log de execução */}
          {taskStates && (
            <div className="rounded-xl border border-gray-200 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Log de execução</p>
              {taskStates.map((task) => (
                <div key={task.id} className="flex items-start gap-2 text-xs">
                  {task.status === "success" && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                  {task.status === "error" && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />}
                  {task.status === "running" && <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-gray-500" />}
                  {task.status === "pending" && <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300" />}
                  <div>
                    <p className={task.status === "error" ? "text-red-600" : "text-gray-600"}>{task.label}</p>
                    {task.message && <p className="text-[11px] text-red-500">{task.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={running}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={running || (isEditing && changes.length === 0)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              {running
                ? "Executando..."
                : isEditing
                  ? `Salvar ${changes.length > 0 ? `(${changes.length})` : ""}`
                  : "Cadastrar"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
