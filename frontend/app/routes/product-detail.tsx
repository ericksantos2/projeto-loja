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
  useProductQuery,
  useProductsQuery,
} from "~/services/products";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Produto | Scout Store" }];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
  const { data: products = [], isLoading: isProductsLoading } = useProductsQuery();
  const summary = useMemo(
    () => products.find((item) => item.slug === params.slug) ?? null,
    [params.slug, products],
  );
  const productQuery = useProductQuery(summary?.id ?? "");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  const product = productQuery.data ?? null;

  useEffect(() => {
    if (!product) return;
    setSelectedImage((current) => current || product.images[0] || product.coverImage || "");
    setSelectedVariant(
      (current) =>
        current ||
        product.variants.find((variant) => variant.available)?.id ||
        product.variants[0]?.id ||
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

  const category = getCategoryById(product.categoryId);
  const shipping = { estimatedDelivery: "3 a 6 dias úteis", returns: "Devolução em até 30 dias" };

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <Breadcrumb items={[{ label: "Início", href: "/" }, { label: category?.name ?? "Produtos" }, { label: product.name }]} />
        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <ProductGallery images={product.images} selectedImage={selectedImage} onSelect={setSelectedImage} productName={product.name} />
          <section>
            <p className="text-sm font-semibold text-amber-700">{category?.name ?? "Scout Store"}</p>
            <div className="mt-2 flex items-start justify-between gap-4"><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{product.name}</h1><RatingBadge rating={product.rating ?? 0} /></div>
            <p className="mt-2 text-sm text-slate-500">{product.reviewCount ?? 0} avaliações</p>
            <div className="mt-6"><PriceTag price={product.price} originalPrice={product.originalPrice} /></div>
            <p className="mt-6 leading-7 text-slate-600">{product.description}</p>
            <VariantSelector variants={product.variants} selectedId={selectedVariant} onSelect={setSelectedVariant} />
            <AddToCartButton available={product.stock > 0} className="mt-6 w-full sm:w-auto" />
            <div className="mt-7"><ShippingInfo {...shipping} /></div>
          </section>
        </div>
        <div className="mt-14 grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-[1fr_.9fr]"><section><h2 className="text-2xl font-bold tracking-tight text-slate-950">Destaques</h2><HighlightsList highlights={product.highlights} /></section><section><h2 className="text-2xl font-bold tracking-tight text-slate-950">Especificações</h2><SpecsList specifications={product.specifications} /></section></div>
        <div className="mt-12"><StockBadge stock={product.stock} /></div>
      </Container>
    </main>
  );
}
