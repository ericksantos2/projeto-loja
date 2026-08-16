import storeData from "~/data/store.mock.json";
import Container from "~/components/ui/Container";
import SectionHeading from "~/components/ui/SectionHeading";
import ProductCard from "./ProductCard";

const newArrivals = [...storeData.products]
  .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
  .slice(0, 4);

export default function NewArrivals() {
  return (
    <section id="novidades" className="bg-slate-50 py-14 sm:py-18 lg:py-20">
      <Container>
        <SectionHeading className="mb-7" eyebrow="ACABOU DE CHEGAR" title="Novidades na Scout" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Container>
    </section>
  );
}
