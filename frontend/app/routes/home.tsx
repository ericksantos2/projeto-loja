import type { Route } from "./+types/home";
import CategoryList from "~/components/home/CategoryList";
import FeaturedCarousel from "~/components/home/FeaturedCarousel";
import NewArrivals from "~/components/home/NewArrivals";
import PromoBanner from "~/components/home/PromoBanner";
import WhyScout from "~/components/home/WhyScout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projeto-loja" },
    { name: "description", content: "Projeto completo de uma loja com Java & React-Router" },
  ];
}

export default function Home() {
  return (
    <>
      <FeaturedCarousel />
      <CategoryList />
      <NewArrivals />
      <PromoBanner />
      <WhyScout />
    </>
  );
}
