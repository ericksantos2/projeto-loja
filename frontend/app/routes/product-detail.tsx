import { useEffect, useState } from "react";
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
import productDetailsData from "~/data/product-details.mock.json";
import storeData from "~/data/store.mock.json";

export function loader({ params }: Route.LoaderArgs) {
  const product = storeData.products.find((item) => item.slug === params.slug);
  const details =
    product &&
    productDetailsData.products.find((item) => item.productId === product.id);

  if (!product || !details) {
    throw new Response("Produto não encontrado", { status: 404 });
  }

  return { product, details };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: "Produto não encontrado | Scout Store" }];

  return [
    { title: `${data.product.name} | Scout Store` },
    { name: "description", content: data.product.shortDescription },
  ];
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, details } = loaderData;
  const category = storeData.categories.find(
    (item) => item.id === product.categoryId,
  );
  const [selectedImage, setSelectedImage] = useState(details.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(
    details.variants.find((v) => v.available)?.id ?? details.variants[0]?.id,
  );

  useEffect(() => {
    setSelectedImage(details.images[0]);
    setSelectedVariant(
      details.variants.find((v) => v.available)?.id ?? details.variants[0]?.id,
    );
  }, [product.id, details]);

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: category?.name ?? "Produtos" },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <ProductGallery
            images={details.images}
            selectedImage={selectedImage}
            onSelect={setSelectedImage}
            productName={product.name}
          />

          <section>
            <p className="text-sm font-semibold text-amber-700">
              {category?.name ?? "Scout Store"}
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {product.name}
              </h1>
              <RatingBadge rating={product.rating} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {product.reviewCount} avaliações
            </p>

            <div className="mt-6">
              <PriceTag
                price={product.price}
                originalPrice={product.originalPrice}
              />
            </div>

            <p className="mt-6 leading-7 text-slate-600">
              {details.description}
            </p>

            <VariantSelector
              variants={details.variants}
              selectedId={selectedVariant}
              onSelect={setSelectedVariant}
            />

            <AddToCartButton
              available={product.stock > 0}
              className="mt-6 w-full sm:w-auto"
            />

            <div className="mt-7">
              <ShippingInfo
                estimatedDelivery={details.shipping.estimatedDelivery}
                returns={details.shipping.returns}
              />
            </div>
          </section>
        </div>

        <div className="mt-14 grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-[1fr_.9fr]">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Destaques
            </h2>
            <HighlightsList highlights={details.highlights} />
          </section>
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Especificações
            </h2>
            <SpecsList specifications={details.specifications} />
          </section>
        </div>

        <div className="mt-12">
          <StockBadge stock={product.stock} />
        </div>
      </Container>
    </main>
  );
}
