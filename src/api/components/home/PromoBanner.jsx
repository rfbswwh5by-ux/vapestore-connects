import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useSite } from "@/lib/SiteContext";

export default function PromoBanner() {
  const site = useSite();
  if (!site.banner_visible || !site.banner_text) return null;

  return (
    <section className="px-6 py-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div
          className="flex flex-col items-start justify-between gap-5 px-6 py-6 sm:flex-row sm:items-center sm:px-8"
          style={{
            backgroundColor: "var(--brand-surface)",
            borderLeft: "2px solid var(--brand-primary)",
          }}
        >
          <p className="max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--brand-ink)" }}>
            {site.banner_text}
          </p>
          {site.banner_link_label ? (
            <Link
              to={site.banner_link_url || "/products"}
              className="group inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase transition-opacity hover:opacity-70"
              style={{ letterSpacing: "0.18em", color: "var(--brand-primary)" }}
            >
              {site.banner_link_label}
              <ArrowRight size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}