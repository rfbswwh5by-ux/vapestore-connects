import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHeader from "@/components/site/PageHeader";
import { useFaqs } from "@/lib/catalog";

export const Route = createFileRoute("/_site/faq")({
  component: FaqPage,
});

function FaqPage() {
  const faqs = useFaqs();

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions we get every week."
        description="If your question isn't here, call the shop during store hours or send us a note. We'd rather answer it than have you guess."
      />

      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {faqs.length ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-b"
                  style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}
                >
                  <AccordionTrigger className="py-6 text-left text-[16px] font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-[15px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                    {String(faq.answer || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index} className={index ? "mt-3" : undefined}>
                          {paragraph}
                        </p>
                      ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
              No questions published yet.
            </p>
          )}

          <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t pt-10 sm:flex-row sm:items-center" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
              Still wondering about something?
            </p>
            <Link to="/contact" className="btn-brand">
              Contact the shop
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}