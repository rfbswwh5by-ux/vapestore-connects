import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { ArrowRight, MapPin, Clock, Phone } from "lucide-react";
import { useSite } from "@/lib/SiteContext";

export default function Hero() {
  const site = useSite();

  return (
    <section className="relative flex min-h-[96svh] flex-col justify-end overflow-hidden">
      <Image
        src={site.hero_image_url}
        alt={`${site.business_name} featured hardware`}
        className="absolute inset-0 h-full w-full object-cover"
        fittingType="fill"
        focalPointY={0.45}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--brand-bg) 4%, color-mix(in srgb, var(--brand-bg) 82%, transparent) 38%, color-mix(in srgb, var(--brand-bg) 45%, transparent) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-10 pt-40 lg:px-10 lg:pb-14">
        <p className="eyebrow fade-up" style={{ animationDelay: "0.05s" }}>
          {site.hero_eyebrow}
        </p>
        <h1
          className="fade-up mt-6 max-w-[19ch] text-[clamp(2.6rem,6.6vw,5.4rem)] font-medium leading-[0.94]"
          style={{ animationDelay: "0.14s", color: "var(--brand-ink)" }}
        >
          {site.hero_headline}
        </h1>
        <p
          className="fade-up mt-7 max-w-xl text-[15px] leading-relaxed"
          style={{ animationDelay: "0.24s", color: "var(--brand-muted)" }}
        >
          {site.hero_subheadline}
        </p>

        <div className="fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.32s" }}>
          <Link to="/products" className="btn-brand group">
            Browse the collection
            <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to="/store" className="btn-ghost-brand">
            Hours & directions
          </Link>
        </div>
      </div>

      <div
        className="relative border-t"
        style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)", backgroundColor: "color-mix(in srgb, var(--brand-bg) 72%, transparent)", backdropFilter: "blur(10px)" }}
      >
        <div className="mx-auto grid max-w-[1400px] divide-y px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-10" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
          <div className="flex items-center gap-3 py-5 sm:pr-6">
            <MapPin size={15} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
            <span className="text-[13px]" style={{ color: "var(--brand-muted)" }}>
              {site.address_line1}, {site.city}
            </span>
          </div>
          <div className="flex items-center gap-3 py-5 sm:px-6">
            <Clock size={15} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
            <span className="text-[13px]" style={{ color: "var(--brand-muted)" }}>
              Open today · {site.hours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.hours || "See hours"}
            </span>
          </div>
          <div className="flex items-center gap-3 py-5 sm:pl-6">
            <Phone size={15} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
            <a
              href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`}
              className="text-[13px] transition-opacity hover:opacity-70"
              style={{ color: "var(--brand-muted)" }}
            >
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}