import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";
import { categoryImage } from "@/lib/defaultMedia";

export default function CategoryRail({ categories }) {
  if (!categories?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/products"
          search={{ category: category.slug || category.name }}
          className="group relative block overflow-hidden"
          style={{ backgroundColor: "var(--brand-surface)" }}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={category.image_url || categoryImage(category.name)}
              alt={category.name}
              className="h-full w-full object-cover opacity-70 transition-all duration-[900ms] group-hover:scale-[1.05] group-hover:opacity-90"
              fittingType="fill"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(5,5,5,0.92) 8%, rgba(5,5,5,0.15) 62%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[13px] font-medium leading-tight" style={{ color: "var(--brand-ink)" }}>
                {category.name}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                  {category.count ? `${category.count} items` : "View"}
                </span>
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.7}
                  className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ color: "var(--brand-primary)" }}
                />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}