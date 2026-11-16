import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useSite } from "@/lib/SiteContext";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Collection", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Visit", to: "/store" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const site = useSite();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "color-mix(in srgb, var(--brand-bg) 82%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          borderBottom: `1px solid ${scrolled ? "color-mix(in srgb, var(--brand-ink) 10%, transparent)" : "transparent"}`,
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link to="/" aria-label={site.business_name}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="group relative font-mono text-[11px] uppercase transition-colors duration-300"
                style={{ letterSpacing: "0.18em", color: "var(--brand-muted)" }}
                activeProps={{ style: { color: "var(--brand-ink)" } }}
              >
                {item.label}
                <span
                  className="absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {site.phone ? (
              <a
                href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`}
                className="hidden items-center gap-2 font-mono text-[11px] uppercase transition-colors duration-300 hover:opacity-80 md:flex"
                style={{ letterSpacing: "0.14em", color: "var(--brand-ink)" }}
              >
                <Phone size={13} strokeWidth={1.6} style={{ color: "var(--brand-primary)" }} />
                {site.phone}
              </a>
            ) : null}
            <Link to="/store" className="btn-brand hidden !px-5 !py-2.5 sm:inline-flex">
              Visit us
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              style={{ color: "var(--brand-ink)" }}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" style={{ backgroundColor: "var(--brand-bg)" }}>
          <div className="flex h-[72px] items-center justify-between px-6">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" style={{ color: "var(--brand-ink)" }}>
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col px-6" aria-label="Mobile">
            {NAV.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b py-5 font-heading text-2xl"
                style={{ color: "var(--brand-ink)", borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}
              >
                {item.label}
                <span className="font-mono text-[10px]" style={{ color: "var(--brand-muted)" }}>
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 space-y-3 px-6">
            {site.phone ? (
              <a href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`} className="btn-ghost-brand w-full">
                Call {site.phone}
              </a>
            ) : null}
            <Link to="/store" onClick={() => setOpen(false)} className="btn-brand w-full">
              Store hours & map
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}