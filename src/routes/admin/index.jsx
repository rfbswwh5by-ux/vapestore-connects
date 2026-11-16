import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowUpRight, Loader2 } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import { mergedSettings } from "@/lib/siteDefaults";
import StatCard from "@/components/admin/StatCard";

export const Route = createFileRoute("/admin/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { api, settings } = useAdmin();
  const [stats, setStats] = useState(null);
  const site = mergedSettings(settings);

  useEffect(() => {
    api("stats").then((res) => {
      if (res?.ok) setStats(res.stats);
    });
  }, [api]);

  const checklist = [
    { label: "Business name set", done: Boolean(site.business_name && site.business_name !== "Your Shop"), to: "/admin/branding" },
    { label: "Logo uploaded", done: Boolean(site.logo_url), to: "/admin/branding" },
    { label: "Brand colours chosen", done: site.color_primary !== "#E3B04B", to: "/admin/appearance" },
    { label: "Address & phone added", done: Boolean(site.address_line1 && site.phone), to: "/admin/store" },
    { label: "Store hours entered", done: Boolean(site.hours?.length), to: "/admin/store" },
    { label: "Products added", done: (stats?.total || 0) > 0, to: "/admin/products" },
    { label: "Categories created", done: (stats?.categories || 0) > 0, to: "/admin/categories" },
    { label: "FAQ published", done: (stats?.faqs || 0) > 0, to: "/admin/faq" },
    { label: "SEO title & description", done: Boolean(site.meta_title && site.meta_description), to: "/admin/settings" },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.2em", color: "var(--brand-primary)" }}>
          Dashboard
        </p>
        <h1 className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight">
          {site.business_name || "Your shop"}
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Everything on the public website is edited from here. Changes go live the moment you save.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total products" value={stats ? stats.total : "—"} hint="In the catalog" />
        <StatCard label="Published" value={stats ? stats.published : "—"} hint="Visible to visitors" />
        <StatCard label="Hidden" value={stats ? stats.hidden : "—"} hint="Drafts & seasonal" />
        <StatCard label="Categories" value={stats ? stats.categories : "—"} hint="Catalog sections" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section
          className="p-5 sm:p-6"
          style={{
            backgroundColor: "var(--brand-surface)",
            border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
            borderRadius: "var(--brand-radius)",
          }}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-[15px] font-medium">Site setup</h2>
            <span className="font-mono text-[11px]" style={{ color: "var(--brand-primary)" }}>
              {doneCount}/{checklist.length}
            </span>
          </div>
          <div className="mt-4 h-1 w-full" style={{ backgroundColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <div
              className="h-1 transition-all duration-500"
              style={{ width: `${(doneCount / checklist.length) * 100}%`, backgroundColor: "var(--brand-primary)" }}
            />
          </div>
          <ul className="mt-5 space-y-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="flex items-center justify-between gap-3 py-1.5 text-[13px] hover:opacity-70" style={{ color: item.done ? "var(--brand-muted)" : "var(--brand-ink)" }}>
                  <span className="flex items-center gap-2.5">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{
                        border: `1px solid ${item.done ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 22%, transparent)"}`,
                        backgroundColor: item.done ? "var(--brand-primary)" : "transparent",
                      }}
                    >
                      {item.done ? <Check size={10} strokeWidth={3} color="#070707" /> : null}
                    </span>
                    {item.label}
                  </span>
                  <ArrowUpRight size={12} style={{ color: "var(--brand-muted)" }} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="p-5 sm:p-6"
          style={{
            backgroundColor: "var(--brand-surface)",
            border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
            borderRadius: "var(--brand-radius)",
          }}
        >
          <h2 className="font-heading text-[15px] font-medium">Needs attention</h2>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
              <span style={{ color: "var(--brand-muted)" }}>Unread messages</span>
              <Link to="/admin/messages" className="font-mono" style={{ color: "var(--brand-primary)" }}>
                {stats ? stats.unreadMessages : <Loader2 size={12} className="animate-spin" />}
              </Link>
            </div>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
              <span style={{ color: "var(--brand-muted)" }}>Featured products</span>
              <Link to="/admin/products" className="font-mono" style={{ color: "var(--brand-primary)" }}>
                Manage
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--brand-muted)" }}>Administrator code</span>
              <Link to="/admin/security" className="font-mono" style={{ color: "var(--brand-primary)" }}>
                Change
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t pt-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              This website shows the catalog and store information only. It has no cart, checkout or online ordering,
              by design.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}