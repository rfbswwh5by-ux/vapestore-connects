import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { useSite } from "@/lib/SiteContext";
import Reveal from "@/components/site/Reveal";
import SectionLabel from "@/components/site/SectionLabel";

export default function AboutSection() {
  const site = useSite();
  const paragraphs = String(site.about_body || "").split("\n").filter(Boolean);

  return (
    <section className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel>The shop</SectionLabel>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="max-w-lg text-[clamp(1.8rem,3.6vw,2.9rem)] font-medium leading-[1.04]">{site.about_heading}</h2>
            <div className="mt-7 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  {paragraph}
                </p>
              ))}
            </div>
            <Link to="/about" className="btn-ghost-brand mt-9">
              More about us
            </Link>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={site.about_image_url}
                  alt={`Inside ${site.business_name}`}
                  className="h-full w-full object-cover"
                  fittingType="fill"
                />
              </div>
              <div
                className="absolute -bottom-6 -left-4 px-6 py-5 sm:-left-6"
                style={{ backgroundColor: "var(--brand-primary)", color: "#070707" }}
              >
                <p className="font-heading text-2xl font-semibold leading-none">2016</p>
                <p className="mt-1 font-mono text-[9px] uppercase" style={{ letterSpacing: "0.18em" }}>
                  Independent ever since
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}