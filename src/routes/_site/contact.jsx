import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import MapEmbed from "@/components/site/MapEmbed";
import HoursTable from "@/components/site/HoursTable";
import { useSite } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";
import { submitContactMessage } from "@/lib/server-fns";

export const Route = createFileRoute("/_site/contact")({
  component: ContactPage,
});

function ContactPage() {
  const site = useSite();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || form.message.trim().length < 5) {
      setError("Please add your name and a short message.");
      return;
    }
    setSending(true);
    try {
      const res = await submitContactMessage({ data: form });
      if (res && res.ok === false) {
        setError(res.error || "We couldn't send that just now. Please call the shop instead.");
        return;
      }
      toast.success("Message sent. We'll get back to you shortly.");
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "", website: "" });
    } catch {
      setError("We couldn't send that just now. Please call the shop instead.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Ask us anything."
        description="Questions about a device, a coil, or whether we have something in stock? Send a note or call during store hours. This form is for questions only — no orders, no online sales."
      />

      <section className="px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            {sent ? (
              <div
                className="flex flex-col items-start px-6 py-10"
                style={{ backgroundColor: "var(--brand-surface)", border: "1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)" }}
              >
                <CheckCircle2 size={26} strokeWidth={1.4} style={{ color: "var(--brand-primary)" }} />
                <h2 className="mt-5 text-xl font-medium">Message sent</h2>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  Thanks — we've got it. We usually reply the same day we're open. If it's urgent, call the shop.
                </p>
                <button type="button" onClick={() => setSent(false)} className="btn-ghost-brand mt-6">
                  Send another message
                </button>
              </div>
            ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                    Name
                  </label>
                  <input id="name" value={form.name} onChange={update("name")} className="field mt-2" required maxLength={120} />
                </div>
                <div>
                  <label htmlFor="phone" className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                    Phone (optional)
                  </label>
                  <input id="phone" value={form.phone} onChange={update("phone")} className="field mt-2" maxLength={60} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                  Email
                </label>
                <input id="email" type="email" value={form.email} onChange={update("email")} className="field mt-2" maxLength={160} />
              </div>

              <div>
                <label htmlFor="message" className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                  Message
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={update("message")}
                  rows={6}
                  required
                  maxLength={4000}
                  className="field mt-2 resize-y"
                  placeholder="Tell us what you're looking for."
                />
              </div>

              <input
                type="text"
                value={form.website}
                onChange={update("website")}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {error ? (
                <p className="text-[13px]" style={{ color: "#fda4af" }}>
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={sending} className="btn-brand w-full disabled:opacity-60">
                {sending ? <Loader2 size={14} className="animate-spin" /> : null}
                {sending ? "Sending" : "Send message"}
              </button>

              <p className="text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                Do not send payment details, and please don't use this form to request a purchase. Age-restricted products
                are sold in store only, to adults 21+ with valid photo ID.
              </p>
            </form>
          )}
          </div>

          <div className="space-y-10">
            <div>
              <p className="eyebrow">Direct</p>
              <ul className="mt-5 space-y-4 text-sm" style={{ color: "var(--brand-muted)" }}>
                <li className="flex gap-3">
                  <Phone size={15} strokeWidth={1.5} className="mt-0.5" style={{ color: "var(--brand-primary)" }} />
                  <a href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`} className="hover:opacity-70">
                    {site.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={15} strokeWidth={1.5} className="mt-0.5" style={{ color: "var(--brand-primary)" }} />
                  <a href={`mailto:${site.email}`} className="hover:opacity-70">
                    {site.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <MapPin size={15} strokeWidth={1.5} className="mt-0.5" style={{ color: "var(--brand-primary)" }} />
                  <span>{fullAddress(site)}</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow flex items-center gap-2">
                <Clock size={13} strokeWidth={1.5} /> Hours
              </p>
              <div className="mt-4">
                <HoursTable compact includeHoliday />
              </div>
            </div>

            <MapEmbed className="h-[280px] w-full" />
          </div>
        </div>
      </section>
    </>
  );
}