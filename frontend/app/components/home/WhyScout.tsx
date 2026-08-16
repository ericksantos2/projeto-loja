import { CreditCard, PackageCheck, ShieldCheck } from "lucide-react";
import Container from "~/components/ui/Container";
import SectionHeading from "~/components/ui/SectionHeading";

const benefits = [
  { icon: PackageCheck, title: "Produtos selecionados", description: "Uma curadoria feita para deixar sua escolha mais simples." },
  { icon: ShieldCheck, title: "Compra segura", description: "Seus dados protegidos em todas as etapas da compra." },
  { icon: CreditCard, title: "Pagamento facilitado", description: "Opções práticas para você finalizar seu pedido." }
];

export default function WhyScout() {
  return (
    <section className="border-y border-white/10 bg-slate-950 py-14 text-white sm:py-18 lg:py-20">
      <Container>
        <SectionHeading className="max-w-xl" eyebrow="A EXPERIÊNCIA SCOUT" title="Por que comprar na Scout?" tone="light" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6 lg:p-8">
              <Icon className="h-7 w-7 text-amber-300" aria-hidden="true" />
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
