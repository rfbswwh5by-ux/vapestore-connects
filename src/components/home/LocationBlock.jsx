import { motion } from "framer-motion";
import { useSite } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";
import MapEmbed from "@/components/site/MapEmbed";
import HoursTable from "@/components/site/HoursTable";
import Reveal from "@/components/site/Reveal";
import SectionLabel from "@/components/site/SectionLabel";

export default function LocationBlock() {
  const site = useSite();

  return (
    <section className="px-6 py-20 lg:px-10 lg:py-28" style={{ backgroundColor: "var(--brand-surface)" }}>
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel>Find us</SectionLabel>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <MapEmbed className="h-full min-h-[380px] w-full" />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-medium leading-[1.05]">
              {site.address_line1}
              <span className="block" style={{ color: "var(--brand-muted)" }}>
                {site.city}, {site.state} {site.postal_code}
              </span>
            </h2>
            {site.address_line2 ? (
              <p className="mt-2 text-sm" style={{ color: "var(--brand-muted)" }}>
                {site.address_line2}
              </p>
            ) : null}

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Hours</p>
                <div className="mt-4">
                  <HoursTable compact />
                </div>
              </div>
              <div>
                <p className="eyebrow">Contact</p>
                <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--brand-muted)" }}>
                  <li>
                    <a href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`} className="hover:opacity-70">
                      {site.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${site.email}`} className="hover:opacity-70">
                      {site.email}
                    </a>
                  </li>
                  <li className="pt-2 text-[12px] leading-relaxed">
                    Free parking behind the building. Entrances on Gallatin and on the alley side.
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-8 font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
              {fullAddress(site) ? "21+ · Photo ID required in store" : ""}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}