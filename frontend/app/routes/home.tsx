import type { Route } from "./+types/home";
import CategoryList from "~/components/home/CategoryList";
import FeaturedCarousel from "~/components/home/FeaturedCarousel";
import NewArrivals from "~/components/home/NewArrivals";
import PromoBanner from "~/components/home/PromoBanner";
import WhyScout from "~/components/home/WhyScout";
import { useCategoriesQuery } from "~/services/products";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projeto-loja" },
    {
      name: "description",
      content: "Projeto completo de uma loja com Java & React-Router",
    },
  ];
}

export default function Home() {
  const { data: categories = [], error, isLoading } = useCategoriesQuery();

  return (
    <>
      <FeaturedCarousel />
      {error ? (
        <p className="px-4 py-4 text-center text-red-500">
          Erro ao carregar categorias: {error.message}
        </p>
      ) : (
        <CategoryList categories={isLoading ? [] : categories} />
      )}
      <NewArrivals />
      <PromoBanner />
      <WhyScout />
    </>
  );
}
