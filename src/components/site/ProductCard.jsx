const AVAILABILITY = {
  in_stock: { label: "In stock", color: "#4ade80" },
  low_stock: { label: "Low stock", color: "#fbbf24" },
  out_of_stock: { label: "Out of stock", color: "#71717a" },
  special_order: { label: "Special order", color: "#38bdf8" },
};

export default function ProductCard({ product, onOpen }) {
  const availability = AVAILABILITY[product.availability] || AVAILABILITY.in_stock;

  return (
    <article className="group relative flex flex-col">
      <button
        type="button"
        onClick={() => onOpen?.(product)}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/5] w-full overflow-hidden text-left"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
        />
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ border: "1px solid color-mix(in srgb, var(--brand-primary) 55%, transparent)" }}
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, rgba(5,5,5,0.85), transparent)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--brand-primary)" }}>
            View details
          </span>
        </span>
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--brand-muted)" }}>
            {product.brand || product.category}
          </p>
          <h3 className="mt-1.5 truncate text-[15px] font-medium" style={{ color: "var(--brand-ink)" }}>
            {product.name}
          </h3>
        </div>
        {product.price_display ? (
          <p className="shrink-0 font-mono text-[13px]" style={{ color: "var(--brand-ink)" }}>
            {product.price_display}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: availability.color }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--brand-muted)" }}>
          {availability.label}
        </span>
      </div>
    </article>
  );
}