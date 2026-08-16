import { Link } from "react-router";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Navegação estrutural"
      className="mb-6 text-sm text-slate-500"
    >
      {items.map((item, index) => (
        <span key={index}>
          {item.href ? (
            <Link to={item.href} className="hover:text-slate-950">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="px-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
