import { useQuery } from "@tanstack/react-query";
import { api, getAssetUrl } from "~/services/api";

export const queries = {
  categories: ["categories"] as const,
  products: ["products"] as const,
  productsFeatured: (featured: boolean) => ["products", "featured", featured] as const,
  productDetail: (id: string) => ["products", "detail", id] as const,
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  shortDescription: string | null;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  reviewCount: number | null;
  stock: number;
  coverImage: string | null;
  createdAt?: string | null;
};

export type ProductDetail = Product & {
  description: string | null;
  highlights: string[];
  images: string[];
  variants: Array<{
    id: string;
    label: string;
    value: string;
    available: boolean;
  }>;
  specifications: Array<{ id: string; label: string; value: string }>;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type CategoryMetadata = {
  id: string;
  name: string;
  slug: string;
};

export const CATEGORY_METADATA: CategoryMetadata[] = [
  { id: "tech", name: "Tecnologia", slug: "tech" },
  { id: "home", name: "Casa", slug: "home" },
  { id: "accessories", name: "Acessórios", slug: "accessories" },
];

export async function getCategories(): Promise<Category[]> {
  const categories =
    await api.get<
      Array<{
        id: string;
        nome: string;
        slug: string;
        descricao: string;
        fotoUrl: string;
      }>
    >("/categorias");
  return categories.map((c) => ({
    id: c.id,
    name: c.nome,
    slug: c.slug,
    description: c.descricao,
    imageUrl: getAssetUrl(c.fotoUrl) ?? "",
  }));
}

export function mapProduct(product: ProdutoResumoResponse): Product {
  return {
    id: String(product.id),
    name: product.nome,
    slug: product.slug,
    categoryId: product.categoryId,
    shortDescription: product.descricaoBreve,
    price: product.preco,
    originalPrice: product.precoOriginal,
    rating: product.rating,
    reviewCount: product.contagemReviews,
    stock: product.estoque ?? 0,
    coverImage: getAssetUrl(product.imagemPrincipal),
    createdAt: product.createdAt,
  };
}

export function mapProductDetail(
  product: ProdutoDetalhadoResponse,
): ProductDetail {
  return {
    ...mapProduct(product),
    description: product.descricao,
    highlights: product.highlights ?? [],
    images: (product.imagens ?? [])
      .map((image) => getAssetUrl(image.imagemUrl))
      .filter((image): image is string => image !== null),
    variants: (product.variantes ?? []).map((variant) => ({
      ...variant,
      available: Boolean(variant.available),
    })),
    specifications: product.especificacoes ?? [],
  };
}

export type ProdutoResumoResponse = {
  id: string;
  nome: string;
  slug: string;
  categoryId: string | null;
  descricaoBreve: string | null;
  preco: number;
  precoOriginal: number | null;
  rating: number | null;
  contagemReviews: number | null;
  estoque: number | null;
  imagemPrincipal: string | null;
  quantidadeImagens?: number | null;
  createdAt?: string | null;
};

type ProdutoDetalhadoResponse = ProdutoResumoResponse & {
  descricao: string | null;
  highlights: string[];
  imagens: Array<{ imagemId: string; imagemUrl: string }>;
  variantes: Array<{
    id: string;
    label: string;
    value: string;
    available: boolean;
  }>;
  especificacoes: Array<{ id: string; label: string; value: string }>;
};

export async function getProducts(featured?: boolean) {
  const products = await api.get<ProdutoResumoResponse[]>(
    `/produtos${featured !== undefined ? `?featured=${featured}` : ""}`,
  );
  return products.map(mapProduct);
}

export async function getProduct(id: string) {
  return mapProductDetail(
    await api.get<ProdutoDetalhadoResponse>(`/produtos/${id}`),
  );
}

export function getCategory(slug: string | null) {
  return CATEGORY_METADATA.find((category) => category.slug === slug);
}

export function getCategoryById(id: string | null) {
  return CATEGORY_METADATA.find((category) => category.id === id);
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queries.categories,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductsQuery(featured?: boolean) {
  return useQuery({
    queryKey:
      featured === undefined ? queries.products : queries.productsFeatured(featured),
    queryFn: () => getProducts(featured),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductQuery(id: string) {
  return useQuery({
    queryKey: queries.productDetail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
