import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Container from "~/components/ui/Container";
import storeData from "~/data/store.mock.json";
import IconButton from "~/components/ui/IconButton";
import { FeaturedSlideDesktop } from "./FeaturedSlideDesktop";
import { FeaturedSlideMobile } from "./FeaturedSlideMobile";

const featuredProducts = storeData.home.featuredProductIds.flatMap((id) => {
  const product = storeData.products.find((item) => item.id === id);
  return product ? [product] : [];
});

export default function FeaturedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (featuredProducts.length === 0) return null;

  const goTo = (index: number) => {
    setActiveIndex((index + featuredProducts.length) % featuredProducts.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);

    if (Math.abs(distance) < 48) return;
    goTo(distance > 0 ? activeIndex - 1 : activeIndex + 1);
  };

  return (
    <section
      className="bg-slate-50 py-6 sm:py-10 lg:py-12"
      aria-roledescription="carrossel"
      aria-label="Produtos em destaque"
    >
      <Container>
        <div
          className="relative touch-pan-y overflow-hidden rounded-2xl bg-slate-950 shadow-xl md:rounded-3xl"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
            setIsDragging(true);
          }}
          onTouchMove={(event) => {
            if (touchStartX.current === null) return;
            setDragOffset(event.touches[0].clientX - touchStartX.current);
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null;
            setDragOffset(0);
            setIsDragging(false);
          }}
        >
          <div
            className={`flex ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {featuredProducts.map((product) => (
              <article key={product.id} className="min-w-full">
                <div className="relative grid min-h-105 overflow-hidden md:flex md:min-h-120 md:items-center lg:min-h-136">
                  <FeaturedSlideMobile product={product} />
                  <FeaturedSlideDesktop product={product} />
                </div>
              </article>
            ))}
          </div>

          <IconButton
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-md hover:bg-white md:left-5 md:p-3"
            aria-label="Produto anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
          </IconButton>
          <IconButton
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-md hover:bg-white md:right-5 md:p-3"
            aria-label="Próximo produto"
          >
            <ChevronRight
              className="h-5 w-5 md:h-6 md:w-6"
              aria-hidden="true"
            />
          </IconButton>

          <div
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-5"
            role="tablist"
            aria-label="Selecionar produto em destaque"
          >
            {featuredProducts.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="tab"
                aria-label={`Exibir ${product.name}`}
                aria-selected={index === activeIndex}
                onClick={() => goTo(index)}
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ease-out ${index === activeIndex ? "w-6 animate-[carousel-indicator-in_300ms_ease-out] bg-amber-300" : "w-2.5 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
