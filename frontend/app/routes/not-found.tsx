import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <SearchX className="h-8 w-8" aria-hidden="true" />
            </div>

            <p className="text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">
              404
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Página não encontrada
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              O endereço acessado não existe ou foi movido. Mas dá pra voltar
              para a loja e continuar explorando os melhores produtos.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar para a home
              </Link>

              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Ver produtos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
