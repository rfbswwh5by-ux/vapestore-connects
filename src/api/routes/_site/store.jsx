import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/site/PageHeader";
import MapEmbed from "@/components/site/MapEmbed";
import HoursTable from "@/components/site/HoursTable";
import Reveal from "@/components/site/Reveal";
import { useSite } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";

export const Route = createFileRoute("/_site/store")({
  component: StorePage,
});

function StorePage() {
  const site = useSite();

  return (
    <>
      <PageHeader
        eyebrow="Store information"
        title="Come by and see it in person."
        description={`${fullAddress(site)} — free parking behind the building. Bring valid photo ID; we check it for every age-restricted purchase.`}
      />

      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <MapEmbed className="h-[420px] w-full" />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Hours</p>
                <div className="mt-4">
                  <HoursTable compact includeHoliday />
                </div>
              </div>
              <div>
                <p className="eyebrow">Contact</p>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--brand-muted)" }}>
                  <li>{site.address_line1}</li>
                  {site.address_line2 ? <li>{site.address_line2}</li> : null}
                  <li>
                    {site.city}, {site.state} {site.postal_code}
                  </li>
                  <li className="pt-2">
                    <a href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`} className="hover:opacity-70">
                      {site.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${site.email}`} className="hover:opacity-70">
                      {site.email}
                    </a>
                  </li>
                </ul>

                <p className="eyebrow mt-8">Age policy</p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  You must be {site.age_minimum} or older to purchase tobacco and vapor products. Valid government-issued
                  photo identification is required for every purchase, regardless of apparent age.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t px-6 py-16 lg:px-10 lg:py-20" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <p className="eyebrow">Store policies</p>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight">The short version.</h2>
          </div>
          <div className="space-y-5">
            {String(site.store_policies || "")
              .split("\n")
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  {paragraph}
                </p>
              ))}
            <p className="border-t pt-6 text-[11px] leading-relaxed" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)", color: "var(--brand-muted)" }}>
              {site.compliance_notice}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}