import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { useSite } from "@/lib/SiteContext";

const AVAILABILITY = {
  in_stock: { label: "In stock now", color: "#4ade80" },
  low_stock: { label: "Low stock", color: "#fbbf24" },
  out_of_stock: { label: "Currently out of stock", color: "#71717a" },
  special_order: { label: "Special order", color: "#38bdf8" },
};

export default function ProductDetailDialog({ product, open, onOpenChange }) {
  const site = useSite();
  if (!product) return null;
  const availability = AVAILABILITY[product.availability] || AVAILABILITY.in_stock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto border-0 p-0 sm:max-w-3xl"
        style={{ backgroundColor: "var(--brand-surface)", borderRadius: 0 }}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-black md:aspect-auto md:min-h-[420px]">
            <Image src={product.image_url} alt={product.name} className="h-full w-full object-cover" fittingType="fill" />
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <p className="eyebrow">{product.brand || product.category}</p>
            <DialogTitle className="mt-3 text-2xl font-medium leading-tight" style={{ color: "var(--brand-ink)" }}>
              {product.name}
            </DialogTitle>
            <DialogDescription className="sr-only">Product details for {product.name}</DialogDescription>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: availability.color }} />
              <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                {availability.label}
              </span>
            </div>

            {product.description ? (
              <p className="mt-5 text-sm leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                {product.description}
              </p>
            ) : null}

            {product.specs?.length ? (
              <dl className="mt-6 divide-y" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
                {product.specs.map((spec, index) => (
                  <div key={`${spec.label}-${index}`} className="flex justify-between gap-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.14em", color: "var(--brand-muted)" }}>
                      {spec.label}
                    </dt>
                    <dd className="text-right text-[13px]" style={{ color: "var(--brand-ink)" }}>
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-auto pt-7">
              {product.price_display ? (
                <p className="font-mono text-xl" style={{ color: "var(--brand-ink)" }}>
                  {product.price_display}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                Available in store only. No online sales, ordering or delivery. 21+ with valid photo ID.
              </p>
              {site.phone ? (
                <a
                  href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`}
                  className="btn-brand mt-5 w-full"
                >
                  Call to check availability
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}