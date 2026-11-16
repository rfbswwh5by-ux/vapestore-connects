import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Package, Layers, LayoutDashboard, Palette, SlidersHorizontal, MapPin, HelpCircle, Inbox, Settings, ShieldCheck, LogOut, Menu, X, ExternalLink, Users } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";

const LINKS = [
  { to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Layers },
  { to: "/admin/homepage", label: "Homepage", Icon: Home },
  { to: "/admin/branding", label: "Branding", Icon: Palette },
  { to: "/admin/appearance", label: "Appearance", Icon: SlidersHorizontal },
  { to: "/admin/store", label: "Store info", Icon: MapPin },
  { to: "/admin/faq", label: "FAQ", Icon: HelpCircle },
  { to: "/admin/messages", label: "Messages", Icon: Inbox },
  { to: "/admin/team", label: "Team access", Icon: Users },
  { to: "/admin/settings", label: "SEO & legal", Icon: Settings },
  { to: "/admin/security", label: "Security", Icon: ShieldCheck },
];

export default function AdminSidebar({ open, onClose }) {
  const { logout, branding } = useAdmin();
  const location = useLocation();

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {LINKS.map(({ to, label, Icon, exact }) => {
        const active = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors"
            style={{
              borderRadius: "var(--brand-radius)",
              backgroundColor: active ? "color-mix(in srgb, var(--brand-primary) 14%, transparent)" : "transparent",
              color: active ? "var(--brand-primary)" : "var(--brand-muted)",
            }}
          >
            <Icon size={16} strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const shell = (extraClass) => (
    <div className={`flex h-full flex-col ${extraClass}`} style={{ backgroundColor: "var(--brand-surface)", borderRight: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
      <div className="flex h-16 items-center justify-between border-b px-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
        <div className="flex min-w-0 items-center gap-2.5">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="" className="h-7 w-auto object-contain" />
          ) : (
            <span className="block h-2 w-2 rotate-45" style={{ backgroundColor: "var(--brand-primary)" }} />
          )}
          <span className="truncate font-heading text-[12px] font-semibold uppercase" style={{ letterSpacing: "0.12em" }}>
            {branding.business_name || "Admin"}
          </span>
        </div>
        <button type="button" onClick={onClose} className="lg:hidden" aria-label="Close menu" style={{ color: "var(--brand-muted)" }}>
          <X size={18} />
        </button>
      </div>

      {nav}

      <div className="border-t p-3" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-[13px]"
          style={{ color: "var(--brand-muted)" }}
        >
          <ExternalLink size={15} strokeWidth={1.6} />
          View website
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px]"
          style={{ color: "var(--brand-muted)" }}
        >
          <LogOut size={15} strokeWidth={1.6} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[248px] shrink-0 lg:block">{shell("sticky top-0 h-screen")}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[264px]">{shell("")}</div>
        </div>
      ) : null}
    </>
  );
}

export function AdminTopbar({ onOpenMenu, title }) {
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-5 lg:px-8" style={{ backgroundColor: "color-mix(in srgb, var(--brand-bg) 88%, transparent)", backdropFilter: "blur(14px)", borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
      <button type="button" onClick={onOpenMenu} className="lg:hidden" aria-label="Open menu" style={{ color: "var(--brand-ink)" }}>
        <Menu size={20} />
      </button>
      <p className="font-heading text-[15px] font-medium">{title}</p>
    </div>
  );
}

export function useAdminTitle() {
  const [title] = useState("");
  return title;
}