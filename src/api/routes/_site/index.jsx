import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/home/Hero";
import CategoryRail from "@/components/home/CategoryRail";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AboutSection from "@/components/home/AboutSection";
import PromoBanner from "@/components/home/PromoBanner";
import LocationBlock from "@/components/home/LocationBlock";
import ProductDetailDialog from "@/components/site/ProductDetailDialog";
import SectionLabel from "@/components/site/SectionLabel";
import { useSite } from "@/lib/SiteContext";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
});

function HomePage() {
  const site = useSite();
  const { products, categories } = useCatalog();
  const [active, setActive] = useState(null);

  const featured = products.filter((product) => product.is_featured).slice(0, 8);

  return (
    <>
      <Hero />

      {site.show_categories ? (
        <section className="px-6 py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <SectionLabel>Browse by category</SectionLabel>
            <div className="mt-10">
              <CategoryRail categories={categories} />
            </div>
          </div>
        </section>
      ) : null}

      {site.show_featured ? <FeaturedProducts products={featured} onOpen={setActive} /> : null}

      {site.banner_visible ? <PromoBanner /> : null}

      {site.show_about ? <AboutSection /> : null}

      {site.show_location ? <LocationBlock /> : null}

      <ProductDetailDialog product={active} open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)} />
    </>
  );
}