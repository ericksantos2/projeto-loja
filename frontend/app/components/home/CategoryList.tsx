import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import storeData from "~/data/store.mock.json";
import Container from "~/components/ui/Container";
import SectionHeading from "~/components/ui/SectionHeading";

export default function CategoryList() {
  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container>
        <div className="mb-7 flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="ENCONTRE O SEU"
            title="Explore por categoria"
          />
          <Link
            to="/produtos"
            className="hidden text-sm font-semibold text-slate-700 hover:text-slate-950 sm:block"
          >
            Ver todos os produtos
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {storeData.categories.map((category) => (
            <Link
              key={category.id}
              to={`/produtos?categoria=${category.slug}`}
              className="group relative h-48 overflow-hidden rounded-2xl bg-slate-950 sm:h-60 lg:h-72"
            >
              <img
                src={category.image}
                alt=""
                className="h-full w-full object-cover transition duration-500 scale-101 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
              <span className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3 text-lg font-bold text-white">
                {category.name}
                <ArrowUpRight
                  className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
