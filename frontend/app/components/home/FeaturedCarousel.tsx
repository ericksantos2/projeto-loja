import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Container from "~/components/ui/Container";
import IconButton from "~/components/ui/IconButton";
import { useProductsQuery } from "~/services/products";
import { FeaturedSlideDesktop } from "./FeaturedSlideDesktop";
import { FeaturedSlideMobile } from "./FeaturedSlideMobile";

export default function FeaturedCarousel() {
  const { data: products = [], error, isLoading } = useProductsQuery(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (error)
    return (
      <p className="bg-slate-50 py-8 text-center text-red-500">
        Erro ao carregar destaques: {error.message}
      </p>
    );
  if (isLoading || products.length === 0)
    return <p className="bg-slate-50 py-8 text-center text-slate-500">Carregando destaques...</p>;

  const goTo = (index: number) => setActiveIndex((index + products.length) % products.length);
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => { if (touchStartX.current === null) return; const distance = event.changedTouches[0].clientX - touchStartX.current; touchStartX.current = null; setDragOffset(0); setIsDragging(false); if (Math.abs(distance) >= 48) goTo(distance > 0 ? activeIndex - 1 : activeIndex + 1); };

  return <section className="bg-slate-50 py-6 sm:py-10 lg:py-12" aria-label="Produtos em destaque"><Container><div className="relative touch-pan-y overflow-hidden rounded-2xl bg-slate-950 shadow-xl md:rounded-3xl" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; setIsDragging(true); }} onTouchMove={(event) => { if (touchStartX.current !== null) setDragOffset(event.touches[0].clientX - touchStartX.current); }} onTouchEnd={handleTouchEnd}><div className={`flex ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`} style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` }}>{products.map((product) => <article key={product.id} className="min-w-full"><div className="relative grid min-h-105 overflow-hidden md:flex md:min-h-120 md:items-center lg:min-h-136"><FeaturedSlideMobile product={product} /><FeaturedSlideDesktop product={product} /></div></article>)}</div><IconButton onClick={() => goTo(activeIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-md hover:bg-white" aria-label="Produto anterior"><ChevronLeft /></IconButton><IconButton onClick={() => goTo(activeIndex + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-md hover:bg-white" aria-label="Próximo produto"><ChevronRight /></IconButton></div></Container></section>;
}
