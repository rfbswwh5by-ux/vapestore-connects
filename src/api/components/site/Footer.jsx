import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useSite, } from "@/lib/SiteContext";
import { fullAddress } from "@/lib/siteDefaults";

const year = 2026;

export default function Footer() {
  const site = useSite();
  const socials = [
    { href: site.social_instagram, Icon: Instagram, label: "Instagram" },
    { href: site.social_facebook, Icon: Facebook, label: "Facebook" },
  ].filter((s) => Boolean(s.href));

  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)", backgroundColor: "var(--brand-surface)" }}
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-20">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            {site.footer_note}
          </p>
          {socials.length ? (
            <div className="mt-6 flex items-center gap-4">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="transition-opacity duration-300 hover:opacity-70"
                  style={{ color: "var(--brand-muted)" }}
                >
                  <Icon size={17} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Collection", to: "/products" },
              { label: "About the shop", to: "/about" },
              { label: "Store information", to: "/store" },
              { label: "FAQ", to: "/faq" },
              { label: "Contact", to: "/contact" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="transition-opacity duration-300 hover:opacity-70"
                  style={{ color: "var(--brand-muted)" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Visit</p>
          <ul className="mt-5 space-y-4 text-sm" style={{ color: "var(--brand-muted)" }}>
            <li className="flex gap-3">
              <MapPin size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <span>{fullAddress(site)}</span>
            </li>
            {site.phone ? (
              <li className="flex gap-3">
                <Phone size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <a href={`tel:${String(site.phone).replace(/[^\d+]/g, "")}`} className="hover:opacity-70">
                  {site.phone}
                </a>
              </li>
            ) : null}
            {site.email ? (
              <li className="flex gap-3">
                <Mail size={15} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:opacity-70">
                  {site.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Hours</p>
          <ul className="mt-5 space-y-2 text-sm">
            {site.hours.slice(0, 7).map((entry) => (
              <li key={entry.day} className="flex justify-between gap-3">
                <span style={{ color: "var(--brand-muted)" }}>{entry.day}</span>
                <span className="font-mono text-[11px]" style={{ color: "var(--brand-ink)" }}>
                  {entry.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="border-t px-6 py-7 lg:px-10"
        style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}
      >
        <div
          className="mx-auto flex max-w-[1400px] flex-col gap-4 text-[11px] md:flex-row md:items-center md:justify-between"
          style={{ color: "var(--brand-muted)" }}
        >
          <p>
            © {year} {site.business_name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:opacity-70">
              Privacy
            </Link>
            <Link to="/terms" className="hover:opacity-70">
              Terms
            </Link>
            <Link to="/store" className="hover:opacity-70">
              Store policies
            </Link>
            <span className="font-mono uppercase" style={{ letterSpacing: "0.18em", color: "var(--brand-primary)" }}>
              21+ only
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}