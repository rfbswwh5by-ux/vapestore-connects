import { Image } from "@/components/ui/image";
import { useSite } from "@/lib/SiteContext";

const SIZES = { sm: "h-8", md: "h-10", lg: "h-14" };

export default function Logo({ onDark = true, className = "" }) {
  const site = useSite();
  const size = SIZES[site.logo_size] || SIZES.md;

  if (site.logo_url) {
    return (
      <span className={`flex items-center ${className}`}>
        <Image
          src={site.logo_url}
          alt={`${site.business_name} logo`}
          className={`${size} w-auto object-contain`}
          fittingType="fit"
        />
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className="block h-2.5 w-2.5 rotate-45"
        style={{ backgroundColor: "var(--brand-primary)" }}
      />
      <span
        className="font-heading text-[15px] font-semibold uppercase leading-none"
        style={{ letterSpacing: "0.14em", color: onDark ? "var(--brand-ink)" : "var(--brand-bg)" }}
      >
        {site.business_name}
      </span>
    </span>
  );
}