import { getAssetUrl } from '~/services/api';
import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/product-detail";
import AddToCartButton from "~/components/ui/AddToCartButton";
import Breadcrumb from "~/components/ui/Breadcrumb";
import Container from "~/components/ui/Container";
import HighlightsList from "~/components/ui/HighlightsList";
import PriceTag from "~/components/ui/PriceTag";
import ProductGallery from "~/components/ui/ProductGallery";
import RatingBadge from "~/components/ui/RatingBadge";
import ShippingInfo from "~/components/ui/ShippingInfo";
import SpecsList from "~/components/ui/SpecsList";
import StockBadge from "~/components/ui/StockBadge";
import VariantSelector from "~/components/ui/VariantSelector";
import {
  getCategoryById,
  mapCategoriesToMetadata,
  useCategoriesQuery,
  useProductQuery,
  useProductsQuery,
} from "~/services/products";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Produto | Scout Store" }];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
  const { data: products = [], isLoading: isProductsLoading } = useProductsQuery();
  const summary = useMemo(
    () => products.find((item) => item.id === params.id) ?? null,
    [params.id, products],
  );
  const productQuery = useProductQuery(summary?.id ?? "");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const categoriesQuery = useCategoriesQuery();

  const product = productQuery.data ?? null;

  useEffect(() => {
    if (!product) return;
    const images = (product.imagens && product.imagens.length > 0 ? product.imagens.map((img: any) => getAssetUrl(img.imagemUrl) || "") : [getAssetUrl(product.imagemPrincipal) || ""]).filter(Boolean);
    const variants = product.variants ?? [];
    setSelectedImage((current) => current || images[0] || "");
    setSelectedVariant(
      (current) =>
        current ||
        variants.find((variant) => variant.available)?.id ||
        variants[0]?.id ||
        "",
    );
  }, [product]);

  if (summary === null && !isProductsLoading) {
    return (
      <Container className="py-14 text-center text-red-500">
        Produto não encontrado.
      </Container>
    );
  }

  if (productQuery.isLoading || isProductsLoading) {
    return <Container className="py-14 text-center">Carregando produto...</Container>;
  }

  if (productQuery.error || !product) {
    return (
      <Container className="py-14 text-center text-red-500">
        Erro: {productQuery.error?.message ?? "Produto não encontrado."}
      </Container>
    );
  }

  const categories = categoriesQuery.data ?? [];
  const category = getCategoryById(product.categoryId ?? product.categoriaId, mapCategoriesToMetadata(categories));
  const shipping = { estimatedDelivery: "3 a 6 dias úteis", returns: "Devolução em até 30 dias" };
  const productName = product.name ?? product.nome ?? "Produto";
  const productImages = (product.imagens && product.imagens.length > 0 ? product.imagens.map((img: any) => getAssetUrl(img.imagemUrl) || "") : [getAssetUrl(product.imagemPrincipal) || ""]).filter(Boolean);
  const productHighlights = product.highlights ?? [];
  const productSpecifications = product.especificacoes ?? [];
  const productPrice = product.price ?? product.preco ?? 0;
  const productOriginalPrice = product.originalPrice ?? null;
  const productVariants = product.variantes ?? [];
  const productStock = product.stock ?? product.estoque ?? 0;
  const productRating = product.rating ?? 0;
  const productReviewCount = product.reviewCount ?? 0;

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: category?.name ?? "Produtos", href: "/produtos" }, { label: productName }]} />
        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <ProductGallery images={productImages} selectedImage={selectedImage} onSelect={setSelectedImage} productName={productName} />
          <section>
            <p className="text-sm font-semibold text-amber-700">{category?.name ?? "Scout Store"}</p>
            <div className="mt-2 flex items-start justify-between gap-4"><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{productName}</h1><RatingBadge rating={productRating} /></div>
            <p className="mt-2 text-sm text-slate-500">{productReviewCount} avaliações</p>
            <div className="mt-6"><PriceTag price={productPrice} originalPrice={productOriginalPrice} /></div>
            <p className="mt-6 leading-7 text-slate-600">{product.description ?? product.descricao ?? ""}</p>
            <VariantSelector variants={productVariants} selectedId={selectedVariant} onSelect={setSelectedVariant} productAvailable={productStock > 0} />
            <AddToCartButton available={productStock > 0} produtoId={product.id} className="mt-6 w-full sm:w-auto" />
            <div className="mt-7"><ShippingInfo {...shipping} /></div>
          </section>
        </div>
        <div className="mt-14 grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-[1fr_.9fr]"><section><h2 className="text-2xl font-bold tracking-tight text-slate-950">Destaques</h2><HighlightsList highlights={productHighlights} /></section><section><h2 className="text-2xl font-bold tracking-tight text-slate-950">Especificações</h2><SpecsList specifications={productSpecifications} /></section></div>
        <div className="mt-12"><StockBadge stock={productStock} /></div>
      </Container>
    </main>
  );
}
