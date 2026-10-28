import { useEffect, useState } from "react";
import Container from "~/components/ui/Container";
import SectionHeading from "~/components/ui/SectionHeading";
import ProductCard from "./ProductCard";
import { getProducts, type Product } from "~/services/products";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then((items) => setProducts(items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4)))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <section id="novidades" className="bg-slate-50 py-14 sm:py-18 lg:py-20">
      <Container>
        <SectionHeading className="mb-7" eyebrow="ACABOU DE CHEGAR" title="Novidades na Scout" />
        {error ? <p className="text-red-500">Erro ao carregar novidades: {error}</p> : products.length === 0 ? <p className="text-slate-500">Carregando novidades...</p> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </Container>
    </section>
  );
}
