import { AtSign, BriefcaseBusiness, Mail } from "lucide-react";
import { Link } from "react-router";
import Container from "./ui/Container";

const inactiveLinks = ["Trabalhe conosco", "Trocas e devoluções", "Perguntas frequentes"];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.2fr_.8fr_.8fr] lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-white" aria-label="Ir para a página inicial da Scout Store">
              <img src="/favicon.svg" alt="" className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight">Scout Store</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Produtos pensados para acompanhar a sua rotina.</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Institucional</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {inactiveLinks.map((link) => (
                <li key={link}>
                  <button type="button" disabled className="cursor-not-allowed text-left text-slate-500" title="Em breve">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Acompanhe a Scout</h2>
            <div className="mt-4 flex gap-3">
              <button type="button" disabled className="cursor-not-allowed rounded-lg border border-white/10 p-2.5 text-slate-500" aria-label="Instagram em breve" title="Em breve">
                <AtSign className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" disabled className="cursor-not-allowed rounded-lg border border-white/10 p-2.5 text-slate-500" aria-label="LinkedIn em breve" title="Em breve">
                <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" disabled className="cursor-not-allowed rounded-lg border border-white/10 p-2.5 text-slate-500" aria-label="E-mail em breve" title="Em breve">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-500">
          © {new Date().getFullYear()} Scout Store · Projeto desenvolvido para portfólio. Links e serviços são apenas demonstrativos.
        </div>
      </Container>
    </footer>
  );
}
