import { ArrowRight, Truck } from "lucide-react";
import Container from "~/components/ui/Container";
import storeData from "~/data/store.mock.json";
import { currencyFormatter } from "~/lib/formatters";

const minimumOrder = currencyFormatter.format(storeData.store.freeShippingMinimum);

export default function PromoBanner() {
  return (
    <section className="py-14 sm:py-18 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 rounded-2xl bg-amber-300 p-6 text-slate-950 sm:p-10 md:flex-row md:items-center md:justify-between lg:rounded-3xl lg:p-12">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-slate-950 p-3 text-amber-300"><Truck className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <p className="text-sm font-bold">FRETE GRÁTIS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Em compras acima de {minimumOrder}</h2>
              <p className="mt-2 text-sm text-slate-800">Aproveite para levar mais dos seus favoritos.</p>
            </div>
          </div>
          <a href="#novidades" className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
            Ver novidades <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </section>
  );
}
