import { Link } from "react-router";

interface ProductBreadcrumbProps {
  currentCategory: { name: string } | null | undefined;
}

export function ProductBreadcrumb({ currentCategory }: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Navegação estrutural"
      className="mb-6 text-sm text-slate-500"
    >
      <Link to="/" className="hover:text-slate-950">
        Início
      </Link>
      <span className="px-2">/</span>
      <span className="text-slate-700">
        {currentCategory?.name ?? "Produtos"}
      </span>
    </nav>
  );
}
