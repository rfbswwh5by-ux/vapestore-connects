import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import SectionLabel from "@/components/site/SectionLabel";

export default function FeaturedProducts({ products, onOpen }) {
  if (!products?.length) return null;

  return (
    <section className="px-6 py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel>On the shelf</SectionLabel>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-[clamp(1.8rem,3.6vw,2.9rem)] font-medium leading-[1.04]">
            Featured this week
          </h2>
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase transition-opacity hover:opacity-70"
            style={{ letterSpacing: "0.18em", color: "var(--brand-primary)" }}
          >
            View all products
            <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index * 0.05, 0.25)}>
              <ProductCard product={product} onOpen={onOpen} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}