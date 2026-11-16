import { createFileRoute } from "@tanstack/react-router";
import { useSettingsDraft } from "@/lib/useSettingsDraft";
import { FONT_CHOICES } from "@/lib/siteDefaults";
import Field, { SectionCard, SelectInput, Toggle } from "@/components/admin/Field";
import ColorField from "@/components/admin/ColorField";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar from "@/components/admin/SaveBar";

export const Route = createFileRoute("/admin/appearance")({
  component: AppearancePage,
});

const BUTTON_STYLES = [
  { value: "sharp", label: "Sharp (architectural)" },
  { value: "soft", label: "Soft corners" },
  { value: "pill", label: "Pill (fully rounded)" },
];

const LOGO_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

function AppearancePage() {
  const { draft, set, save, saving } = useSettingsDraft();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Website appearance</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Typography, spacing and button shape for the whole site. These settings apply instantly across every page.
        </p>
      </div>

      <SectionCard title="Palette" description="The complete colour system. Text colours stay readable on dark backgrounds.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField label="Primary accent" value={draft.color_primary} onChange={(value) => set("color_primary", value)} />
          <ColorField label="Secondary accent" value={draft.color_secondary} onChange={(value) => set("color_secondary", value)} />
          <ColorField label="Background" value={draft.color_background} onChange={(value) => set("color_background", value)} />
          <ColorField label="Surface / panels" value={draft.color_surface} onChange={(value) => set("color_surface", value)} />
          <ColorField label="Primary text" value={draft.color_ink} onChange={(value) => set("color_ink", value)} />
          <ColorField label="Muted text" value={draft.color_muted} onChange={(value) => set("color_muted", value)} />
        </div>
      </SectionCard>

      <SectionCard title="Typography" description="Choose a pairing that matches the shop's character.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline font">
            <SelectInput value={draft.font_heading} onChange={(event) => set("font_heading", event.target.value)} options={FONT_CHOICES} />
          </Field>
          <Field label="Body font">
            <SelectInput value={draft.font_body} onChange={(event) => set("font_body", event.target.value)} options={FONT_CHOICES} />
          </Field>
        </div>
        <div className="mt-5 border p-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <p className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.2em", color: "var(--brand-muted)" }}>
            Preview
          </p>
          <p className="mt-3 text-2xl" style={{ fontFamily: `"${draft.font_heading}", sans-serif` }}>
            {draft.business_name || "Your shop"}
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: `"${draft.font_body}", sans-serif`, color: "var(--brand-muted)" }}>
            A short, deliberate list of hardware and liquid — every one of them tried by the people behind the counter.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Buttons, header & logo" description="Shape and scale details across the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button style">
            <SelectInput value={draft.button_style} onChange={(event) => set("button_style", event.target.value)} options={BUTTON_STYLES} />
          </Field>
          <Field label="Logo size">
            <SelectInput value={draft.logo_size} onChange={(event) => set("logo_size", event.target.value)} options={LOGO_SIZES} />
          </Field>
          <Field label="Header style">
            <SelectInput
              value={draft.header_style}
              onChange={(event) => set("header_style", event.target.value)}
              options={[
                { value: "ghost", label: "Transparent, blurs on scroll" },
                { value: "solid", label: "Always solid" },
              ]}
            />
          </Field>
          <Field label="Footer style">
            <SelectInput
              value={draft.footer_style}
              onChange={(event) => set("footer_style", event.target.value)}
              options={[
                { value: "detailed", label: "Detailed with hours" },
                { value: "minimal", label: "Minimal" },
              ]}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Background image" description="Optional. Adds a subtle photo texture behind the page.">
        <div className="max-w-md">
          <ImageUpload label="Page background" value={draft.background_image_url} onChange={(url) => set("background_image_url", url)} compact />
        </div>
      </SectionCard>

      <SectionCard title="Homepage section visibility" description="Turn off any section you don't want to show.">
        <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
          <Toggle label="Featured categories" description="The category rail under the hero." checked={draft.show_categories} onChange={(value) => set("show_categories", value)} />
          <Toggle label="Featured products" description="The featured grid on the homepage." checked={draft.show_featured} onChange={(value) => set("show_featured", value)} />
          <Toggle label="About section" description="Short introduction with a photograph." checked={draft.show_about} onChange={(value) => set("show_about", value)} />
          <Toggle label="Location & hours" description="Map, address and opening times." checked={draft.show_location} onChange={(value) => set("show_location", value)} />
          <Toggle label="Promotional banner" description="A single line announcement strip." checked={draft.banner_visible} onChange={(value) => set("banner_visible", value)} />
        </div>
      </SectionCard>

      <SaveBar onSave={() => save()} saving={saving} />
    </div>
  );
}