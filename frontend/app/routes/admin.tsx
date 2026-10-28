import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/admin";
import Container from "~/components/ui/Container";
import {
  clearAuthSession,
  fetchCurrentUser,
  isAdminOrGestor,
  isAuthenticated,
} from "~/services/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Painel administrativo | Scout Store" },
    { name: "robots", content: "noindex" },
  ];
}

export async function clientLoader() {
  if (!isAuthenticated()) {
    return { status: "unauthorized" as const, cargo: null };
  }

  try {
    const usuario = await fetchCurrentUser();
    if (!isAdminOrGestor(usuario.cargo)) {
      return { status: "forbidden" as const, cargo: usuario.cargo };
    }
    return { status: "authorized" as const, cargo: usuario.cargo };
  } catch {
    clearAuthSession();
    return { status: "unauthorized" as const, cargo: null };
  }
}

clientLoader.hydrate = true;

function AcessoNegado({ title, message }: { title: string; message: string }) {
  return (
    <main className="bg-slate-50 py-16">
      <Container className="max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Voltar para a loja
          </Link>
        </div>
      </Container>
    </main>
  );
}

export default function AdminPage({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === "unauthorized") {
    return (
      <AcessoNegado
        title="Faça login para continuar"
        message="É necessário estar autenticado para acessar o painel administrativo."
      />
    );
  }

  if (loaderData.status === "forbidden") {
    return (
      <AcessoNegado
        title="Acesso restrito"
        message="Seu usuário não tem permissão para acessar o painel administrativo."
      />
    );
  }

  return (
    <main className="bg-slate-50 py-8 sm:py-10 lg:py-14">
      <Container>
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">
          Área restrita
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Painel administrativo
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Você está autenticado como{" "}
          <span className="font-semibold text-slate-900">{loaderData.cargo}</span>.
        </p>
      </Container>
    </main>
  );
}