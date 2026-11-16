import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/site/Reveal";
import { useSite } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";

export const Route = createFileRoute("/_site/about")({
  component: AboutPage,
});

function AboutPage() {
  const site = useSite();
  const paragraphs = String(site.about_body || "").split("\n").filter(Boolean);

  return (
    <>
      <PageHeader eyebrow="About the shop" title={site.about_heading} description={site.tagline} />

      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 border-t pt-8" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
              <p className="eyebrow">The store</p>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                {fullAddress(site)}
              </p>
              <p className="mt-2 font-mono text-[11px]" style={{ color: "var(--brand-ink)" }}>
                {site.phone}
              </p>
              <Link to="/store" className="btn-ghost-brand mt-6">
                Hours & directions
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image src={site.about_image_url} alt={`Inside ${site.business_name}`} className="h-full w-full object-cover" fittingType="fill" />
            </div>
          </Reveal>
        </div>
      </section>

      {site.about_sections?.length ? (
        <section className="border-t px-6 py-16 lg:px-10 lg:py-24" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2 lg:gap-20">
            {site.about_sections.map((section, index) => (
              <Reveal key={index} delay={Math.min(index * 0.06, 0.2)}>
                <p className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.2em", color: "var(--brand-primary)" }}>
                  0{index + 1}
                </p>
                <h2 className="mt-4 text-[clamp(1.4rem,2.6vw,2rem)] font-medium leading-tight">{section.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  {section.body}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] border-t pt-10" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <p className="max-w-3xl text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            {site.compliance_notice}
          </p>
        </div>
      </section>
    </>
  );
}