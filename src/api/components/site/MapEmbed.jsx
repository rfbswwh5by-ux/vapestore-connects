import { ArrowUpRight } from "lucide-react";
import { useSite } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";

export default function MapEmbed({ className = "" }) {
  const site = useSite();
  const query = site.maps_query || fullAddress(site);
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: "var(--brand-surface)" }}>
      <iframe
        title={`Map to ${site.business_name}`}
        src={embed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-[320px] w-full"
        style={{ border: 0, filter: "grayscale(1) invert(0.93) contrast(0.82) brightness(0.95)" }}
      />
      <a
        href={external}
        target="_blank"
        rel="noreferrer noopener"
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] uppercase transition-opacity hover:opacity-85"
        style={{
          letterSpacing: "0.16em",
          backgroundColor: "var(--brand-primary)",
          color: "#070707",
          borderRadius: "var(--brand-radius)",
        }}
      >
        Get directions
        <ArrowUpRight size={13} strokeWidth={2} />
      </a>
    </div>
  );
}