import Container from "~/components/ui/Container";
import SectionHeading from "~/components/ui/SectionHeading";
import ProductCard from "./ProductCard";
import { useProductsQuery } from "~/services/products";

export default function NewArrivals() {
  const { data: products = [], error, isLoading } = useProductsQuery();
  const newestProducts = [...products]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 4);

  return (
    <section id="novidades" className="bg-slate-50 py-14 sm:py-18 lg:py-20">
      <Container>
        <SectionHeading className="mb-7" eyebrow="ACABOU DE CHEGAR" title="Novidades na Scout" />
        {error ? (
          <p className="text-red-500">Erro ao carregar novidades: {error.message}</p>
        ) : isLoading ? (
          <p className="text-slate-500">Carregando novidades...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
