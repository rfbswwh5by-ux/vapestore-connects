import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/site/PageHeader";
import { useSite } from "@/lib/SiteContext";

export const Route = createFileRoute("/_site/terms")({
  component: TermsPage,
});

function TermsPage() {
  const site = useSite();

  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & conditions" description={`The terms that apply to your use of this website and to purchases made at ${site.business_name}.`} />
      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          {String(site.terms_conditions || "")
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
      </section>
    </>
  );
}