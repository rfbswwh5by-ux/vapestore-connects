import { createContext, useContext, useEffect } from "react";
import { mergedSettings } from "@/lib/siteDefaults";

const SiteContext = createContext(mergedSettings(null));

export const useSite = () => useContext(SiteContext);

export const FALLBACK_SERIF = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function brandStyle(site) {
  return {
    "--brand-bg": site.color_background,
    "--brand-surface": site.color_surface,
    "--brand-primary": site.color_primary,
    "--brand-secondary": site.color_secondary,
    "--brand-ink": site.color_ink,
    "--brand-muted": site.color_muted,
    "--brand-radius": site.button_style === "pill" ? "999px" : site.button_style === "soft" ? "10px" : "2px",
    "--font-heading": `"${site.font_heading}", ${FALLBACK_SERIF}`,
    "--font-body": `"${site.font_body}", ${FALLBACK_SERIF}`,
    "--font-display": `"${site.font_heading}", ${FALLBACK_SERIF}`,
  };
}

export function SiteProvider({ settings, children, plain = false }) {
  const site = mergedSettings(settings);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = site.meta_title || `${site.business_name} — ${site.tagline}`;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    if (site.meta_description) desc.setAttribute("content", site.meta_description);

    if (site.favicon_url) {
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement("link");
        icon.setAttribute("rel", "icon");
        document.head.appendChild(icon);
      }
      icon.setAttribute("href", site.favicon_url);
    }
  }, [site.meta_title, site.meta_description, site.business_name, site.tagline, site.favicon_url]);

  const content = (
    <SiteContext.Provider value={site}>
      <div style={{ backgroundColor: "var(--brand-bg)", color: "var(--brand-ink)" }} className="min-h-screen">
        {children}
      </div>
    </SiteContext.Provider>
  );

  return (
    <div style={brandStyle(site)} className={plain ? undefined : "contents"}>
      {content}
    </div>
  );
}