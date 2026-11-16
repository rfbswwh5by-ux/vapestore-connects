import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import ProductCard from "@/components/site/ProductCard";
import ProductDetailDialog from "@/components/site/ProductDetailDialog";
import Reveal from "@/components/site/Reveal";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/_site/products")({
  validateSearch: (search) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, categories, loading } = useCatalog();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  const activeCategory = useMemo(() => {
    if (!category) return null;
    return categories.find((item) => item.slug === category || item.name === category) || null;
  }, [category, categories]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory = activeCategory ? product.category === activeCategory.name : true;
      const matches =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.brand || "").toLowerCase().includes(term) ||
        (product.category || "").toLowerCase().includes(term);
      return inCategory && matches;
    });
  }, [products, activeCategory, query]);

  const select = (slug) => navigate({ search: slug ? { category: slug } : {} });

  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={activeCategory ? activeCategory.name : "Everything on our shelves."}
        description={
          activeCategory?.description ||
          "A short, deliberate list. Every device, bottle and coil here has been run by someone behind the counter. Nothing is sold online — come in and we'll walk you through it."
        }
      />

      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                type="button"
                onClick={() => select(null)}
                className="shrink-0 px-4 py-2 font-mono text-[10px] uppercase transition-colors"
                style={{
                  letterSpacing: "0.16em",
                  borderRadius: "var(--brand-radius)",
                  border: "1px solid",
                  borderColor: !activeCategory ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 14%, transparent)",
                  color: !activeCategory ? "var(--brand-primary)" : "var(--brand-muted)",
                }}
              >
                All products
              </button>
              {categories.map((item) => {
                const isActive = activeCategory?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item.slug)}
                    className="shrink-0 px-4 py-2 font-mono text-[10px] uppercase transition-colors"
                    style={{
                      letterSpacing: "0.16em",
                      borderRadius: "var(--brand-radius)",
                      border: "1px solid",
                      borderColor: isActive ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 14%, transparent)",
                      color: isActive ? "var(--brand-primary)" : "var(--brand-muted)",
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border px-4 py-2.5 lg:w-72" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 14%, transparent)" }}>
              <Search size={15} strokeWidth={1.6} style={{ color: "var(--brand-muted)" }} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the collection"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "var(--brand-ink)" }}
                aria-label="Search products"
              />
            </div>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
            {loading ? "Loading" : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
          </p>

          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] w-full" style={{ backgroundColor: "var(--brand-surface)" }} />
                  <div className="mt-4 h-3 w-2/3" style={{ backgroundColor: "var(--brand-surface)" }} />
                </div>
              ))}
            </div>
          ) : visible.length ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {visible.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index * 0.04, 0.24)}>
                  <ProductCard product={product} onOpen={setActive} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-16 border py-20 text-center" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
              <p className="font-heading text-xl">Nothing matches that yet.</p>
              <p className="mt-2 text-sm" style={{ color: "var(--brand-muted)" }}>
                Try another category, or call the shop and we'll check the back room.
              </p>
            </div>
          )}
        </div>
      </section>

      <ProductDetailDialog product={active} open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)} />
    </>
  );
}