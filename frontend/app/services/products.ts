import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "./api";

// --- Interfaces da API (Campos em Português) ---
export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  fotoUrl?: string;
  /** Posição de exibição nas listas de categorias (0 = primeira). */
  posicao?: number | null;
  /** Aliases opcionais de compatibilidade */
  name?: string;
  description?: string;
  imageUrl?: string;
}

export type Category = Categoria;

export interface ImagemDTO {
  imagemId: string;
  imagemUrl: string;
}

export interface EspecificacaoDTO {
  id: string;
  label: string;
  value: string;
}

export interface VarianteDTO {
  id: string;
  label: string;
  value: string;
  available: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  descricaoBreve?: string;
  preco: number;
  precoOriginal?: number | null;
  rating?: number;
  contagemReviews?: number;
  estoque: number;
  imagemPrincipal?: string | null;
  quantidadeImagens?: number;
  featured?: boolean;
  /** Posição no carrossel de destaques (0 = primeiro). */
  posicaoDestaque?: number | null;
  categoryId?: string;
  /** Compatibilidade com telas antigas que usavam o nome em português. */
  categoriaId?: string;
  highlights?: string[];
  imagens?: ImagemDTO[];
  especificacoes?: EspecificacaoDTO[];
  variantes?: VarianteDTO[];
  createdAt?: string;
  /** Aliases opcionais de compatibilidade */
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  originalPrice?: number | null;
  reviewCount?: number;
  stock?: number;
  variants?: VarianteDTO[];
  category?: Categoria;
  categoria?: Categoria;
}

export type Product = Produto;

/** Corpo aceito pelo backend ao criar/atualizar um produto. */
export interface ProdutoPayload {
  nome: string;
  descricao?: string;
  descricaoBreve?: string;
  categoryId?: string;
  preco: number;
  precoOriginal?: number;
  estoque: number;
  featured?: boolean;
  imagemPrincipal?: string;
  highlights?: string[];
  especificacoes?: { label: string; value: string }[];
  variantes?: { label: string; value: string; available: boolean }[];
}

/** Corpo aceito pelo backend ao criar/atualizar uma categoria. */
export interface CategoriaPayload {
  nome: string;
  descricao?: string;
}

// --- Funções da API ---
function extractArray<T>(data: T[] | { content: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).content)) return (data as any).content;
  return [];
}

export const getProducts = async (): Promise<Produto[]> => {
  const response = await api.get<any>('/produtos');
  return extractArray(response);
};

export const getProductById = async (id: string): Promise<Produto | null> => {
  const response = await api.get<any>(`/produtos/${id}`);
  return response || null;
};

export const getCategories = async (): Promise<Categoria[]> => {
  const response = await api.get<any>('/categorias');
  return extractArray(response);
};

// --- CRUD (rotas autenticadas: exigem cargo ADMIN) ---
export const createProduct = async (
  payload: ProdutoPayload,
  imagens: File[] = [],
): Promise<Produto> => {
  const formData = new FormData();
  formData.append(
    'produto',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  );
  imagens.forEach((imagem) => formData.append('imagens', imagem));

  return api.postForm<Produto>('/produtos', formData, { requiresAuth: true });
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProdutoPayload>,
): Promise<Produto> => {
  return api.patch<Produto>(`/produtos/${id}`, payload, { requiresAuth: true });
};

export const deleteProduct = async (id: string): Promise<void> => {
  return api.delete<void>(`/produtos/${id}`, { requiresAuth: true });
};

/** Ordem final do carrossel de destaques; produtos omitidos ficam no fim. */
export const reorderFeaturedProducts = async (produtoIds: string[]): Promise<string[]> => {
  return api.put<string[]>('/produtos/destaques/ordem', { produtoIds }, { requiresAuth: true });
};

/** Substitui a lista completa de highlights do produto. */
export const updateProductHighlights = async (
  id: string,
  highlights: string[],
): Promise<string[]> => {
  return api.put<string[]>(`/produtos/${id}/highlights`, highlights, { requiresAuth: true });
};

export const addProductImages = async (
  id: string,
  imagens: File[],
): Promise<ImagemDTO[]> => {
  const formData = new FormData();
  imagens.forEach((imagem) => formData.append('imagens', imagem));
  return api.postForm<ImagemDTO[]>(`/produtos/${id}/imagens`, formData, { requiresAuth: true });
};

export const replaceProductImage = async (
  produtoId: string,
  imagemId: string,
  imagem: File,
): Promise<ImagemDTO> => {
  const formData = new FormData();
  formData.append('imagem', imagem);
  return api.putForm<ImagemDTO>(`/produtos/${produtoId}/imagens/${imagemId}`, formData, {
    requiresAuth: true,
  });
};

export const deleteProductImage = async (
  produtoId: string,
  imagemId: string,
): Promise<void> => {
  return api.delete<void>(`/produtos/${produtoId}/imagens/${imagemId}`, { requiresAuth: true });
};

export interface EspecificacaoPayload {
  label: string;
  value: string;
}

export interface VariantePayload {
  label: string;
  value: string;
  available: boolean;
}

export const createProductSpecification = async (
  produtoId: string,
  payload: EspecificacaoPayload,
): Promise<EspecificacaoDTO> => {
  const [criada] = await api.post<EspecificacaoDTO[]>(
    `/produtos/${produtoId}/especificacoes`,
    [payload],
    { requiresAuth: true },
  );
  if (!criada) throw new Error('O servidor não retornou a especificação criada.');
  return criada;
};

export const updateProductSpecification = async (
  produtoId: string,
  especificacaoId: string,
  payload: EspecificacaoPayload,
): Promise<EspecificacaoDTO> => {
  return api.put<EspecificacaoDTO>(
    `/produtos/${produtoId}/especificacoes/${especificacaoId}`,
    payload,
    { requiresAuth: true },
  );
};

export const deleteProductSpecification = async (
  produtoId: string,
  especificacaoId: string,
): Promise<void> => {
  return api.delete<void>(`/produtos/${produtoId}/especificacoes/${especificacaoId}`, {
    requiresAuth: true,
  });
};

export const createProductVariant = async (
  produtoId: string,
  payload: VariantePayload,
): Promise<VarianteDTO> => {
  const [criada] = await api.post<VarianteDTO[]>(
    `/produtos/${produtoId}/variantes`,
    [payload],
    { requiresAuth: true },
  );
  if (!criada) throw new Error('O servidor não retornou a variante criada.');
  return criada;
};

export const updateProductVariant = async (
  produtoId: string,
  varianteId: string,
  payload: VariantePayload,
): Promise<VarianteDTO> => {
  return api.put<VarianteDTO>(
    `/produtos/${produtoId}/variantes/${varianteId}`,
    payload,
    { requiresAuth: true },
  );
};

export const deleteProductVariant = async (
  produtoId: string,
  varianteId: string,
): Promise<void> => {
  return api.delete<void>(`/produtos/${produtoId}/variantes/${varianteId}`, {
    requiresAuth: true,
  });
};

/** Ordem final das especificações; as omitidas ficam no fim, na ordem atual. */
export const reorderProductSpecifications = async (
  produtoId: string,
  especificacaoIds: string[],
): Promise<EspecificacaoDTO[]> => {
  return api.put<EspecificacaoDTO[]>(
    `/produtos/${produtoId}/especificacoes/ordem`,
    { especificacaoIds },
    { requiresAuth: true },
  );
};

/** Ordem final das variantes; as omitidas ficam no fim, na ordem atual. */
export const reorderProductVariants = async (
  produtoId: string,
  varianteIds: string[],
): Promise<VarianteDTO[]> => {
  return api.put<VarianteDTO[]>(
    `/produtos/${produtoId}/variantes/ordem`,
    { varianteIds },
    { requiresAuth: true },
  );
};

/** Envia a ordem final da galeria; imagens omitidas ficam no fim, na ordem atual. */
export const reorderProductImages = async (
  produtoId: string,
  imagemIds: string[],
): Promise<ImagemDTO[]> => {
  return api.put<ImagemDTO[]>(
    `/produtos/${produtoId}/imagens/ordem`,
    { imagemIds },
    { requiresAuth: true },
  );
};

export const createCategory = async (
  payload: CategoriaPayload,
  foto?: File | null,
): Promise<Categoria> => {
  const formData = new FormData();
  formData.append(
    'categoria',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  );
  if (foto) formData.append('foto', foto);

  return api.postForm<Categoria>('/categorias', formData, { requiresAuth: true });
};

export const updateCategory = async (
  id: string,
  payload: CategoriaPayload,
  foto?: File | null,
): Promise<Categoria> => {
  const formData = new FormData();
  formData.append(
    'categoria',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  );
  if (foto) formData.append('foto', foto);

  return api.patchForm<Categoria>(`/categorias/${id}`, formData, { requiresAuth: true });
};

export const deleteCategory = async (id: string): Promise<void> => {
  return api.delete<void>(`/categorias/${id}`, { requiresAuth: true });
};

/** Ordem final das categorias; as omitidas ficam no fim, na ordem atual. */
export const reorderCategories = async (categoriaIds: string[]): Promise<string[]> => {
  return api.put<string[]>('/categorias/ordem', { categoriaIds }, { requiresAuth: true });
};

// --- Helpers para compatibilidade com código existente ---
export const getCategory = <T extends Categoria>(
  categoriaId: string,
  categories: T[] = [],
): T | undefined => {
  if (!categoriaId) return undefined;
  return categories.find((category) => category.id === categoriaId);
};

export const getCategoryById = <T extends Categoria>(
  id: string | number | null | undefined,
  categories: T[] = [],
): T | undefined => {
  if (id === null || id === undefined || id === "") return undefined;
  return categories.find((category) => category.id === String(id));
};

export type CategoriaMetadata = Categoria & {
  name: string;
  description?: string;
  imageUrl?: string;
};

export type CategoryMetadata = CategoriaMetadata;

export const mapCategoriesToMetadata = (categories: Categoria[] = []): CategoriaMetadata[] => {
  return categories.map((c) => ({
    ...c,
    name: c.nome,
    description: c.descricao,
    imageUrl: c.fotoUrl,
  }));
};

// --- Hooks (nomes que o resto do app espera) ---
type ProductListQueryOptions = Omit<UseQueryOptions<Produto[], Error>, "queryKey" | "queryFn">;
type ProductQueryOptions = Omit<UseQueryOptions<Produto | null, Error>, "queryKey" | "queryFn">;


export const useCategoriesQuery = (options?: any) => {
  return useQuery<Categoria[], Error>({
    queryKey: ['categorias'],
    queryFn: getCategories,
    ...options,
  });
};

export const useProductsQuery = (options?: any) => {
  return useQuery<Produto[], Error>({
    queryKey: ['produtos'],
    queryFn: getProducts,
    ...options,
  });
};

export const useProdutosQuery = useProductsQuery;

export const useProductQuery = (id: string, options?: any) => {
  return useQuery<Produto | null, Error>({
    queryKey: ['produto', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    ...options,
  });
};

export const useFeaturedProductsQuery = (options?: any) => {
  return useQuery<Produto[], Error>({
    queryKey: ['produtos', 'destaques'],
    queryFn: async () => {
      const products = await getProducts();
      return products
        .filter((p) => p.featured)
        .sort((a, b) => {
          const posicaoA = a.posicaoDestaque ?? Number.MAX_SAFE_INTEGER;
          const posicaoB = b.posicaoDestaque ?? Number.MAX_SAFE_INTEGER;
          if (posicaoA !== posicaoB) return posicaoA - posicaoB;
          return a.nome.localeCompare(b.nome, 'pt-BR');
        });
    },
    ...options,
  });
};

export const useNewArrivalsQuery = (options?: any) => {
  return useQuery<Produto[], Error>({
    queryKey: ['produtos', 'novidades'],
    queryFn: async () => {
      const products = await getProducts();
      return [...products].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    },
    ...options,
  });
};
