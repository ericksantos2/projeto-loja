import { ArrowRight, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/categorias";
import ProductCard from "~/components/home/ProductCard";
import Container from "~/components/ui/Container";
import { CATEGORY_METADATA, getProducts, type Product } from "~/services/products";

export function meta({}: Route.MetaArgs) { return [{ title: "Categorias | Scout Store" }, { name: "description", content: "Explore as categorias da Scout Store e veja os produtos em destaque." }]; }
export default function CategoriesPage() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getProducts().then(setProducts).catch((err: Error) => setError(err.message)).finally(() => setLoading(false)); }, []);
  const visibleCategoryLinks = showAllCategories ? CATEGORY_METADATA : CATEGORY_METADATA.slice(0, 3);
  if (loading) return <Container className="py-14 text-center">Carregando categorias...</Container>;
  if (error) return <Container className="py-14 text-center text-red-500">Erro: {error}</Container>;
  return <main className="bg-slate-50 py-8 sm:py-10 lg:py-14"><Container><div className="mb-8 sm:mb-10"><p className="text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">Navegue por assunto</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Categorias</h1></div><section className="mb-12 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Todas as categorias</h2>{CATEGORY_METADATA.length > 3 && <button type="button" onClick={() => setShowAllCategories((current) => !current)} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">{showAllCategories ? "Ver menos" : "Ver mais"}{showAllCategories ? <ChevronUp /> : <ChevronDown />}</button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleCategoryLinks.map((category) => <Link key={category.id} to={`/produtos?categoria=${category.slug}`} className="group flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3 text-sm font-medium">{category.name}<ChevronRight className="h-4 w-4" /></Link>)}</div></section><div className="space-y-10">{CATEGORY_METADATA.map((category) => { const categoryProducts = products.filter((product) => product.categoryId === category.id).slice(0, 4); return <section key={category.id} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between border-b pb-4"><h2 className="text-2xl font-bold">{category.name}</h2><Link to={`/produtos?categoria=${category.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold">Ver mais<ArrowRight className="h-4 w-4" /></Link></div><div className="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4">{categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="grid gap-5 sm:hidden">{categoryProducts.slice(0, 1).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>; })}</div></Container></main>;
}
