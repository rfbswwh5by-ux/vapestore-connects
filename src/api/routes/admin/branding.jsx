import { createFileRoute } from "@tanstack/react-router";
import { useSettingsDraft } from "@/lib/useSettingsDraft";
import Field, { SectionCard, TextArea, TextInput } from "@/components/admin/Field";
import ColorField from "@/components/admin/ColorField";
import ImageUpload from "@/components/admin/ImageUpload";
import { HoursEditor, HOURS_FIELDS } from "@/components/admin/HoursEditor";
import SaveBar from "@/components/admin/SaveBar";

export const Route = createFileRoute("/admin/branding")({
  component: BrandingPage,
});

function BrandingPage() {
  const { draft, set, save, saving } = useSettingsDraft();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Business branding</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          The business name, logo and colours you set here are used everywhere: navigation, footer, page titles,
          browser tab, the age gate and every page on the site. Nothing is hardcoded.
        </p>
      </div>

      <SectionCard title="Identity" description="Your shop name as customers know it.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <TextInput value={draft.business_name || ""} onChange={(event) => set("business_name", event.target.value)} maxLength={80} />
          </Field>
          <Field label="Tagline">
            <TextInput value={draft.tagline || ""} onChange={(event) => set("tagline", event.target.value)} maxLength={80} />
          </Field>
          <ImageUpload
            label="Logo"
            value={draft.logo_url}
            onChange={(url) => set("logo_url", url)}
            compact
            hint="PNG or SVG with a transparent background works best."
          />
          <ImageUpload
            label="Favicon"
            value={draft.favicon_url}
            onChange={(url) => set("favicon_url", url)}
            compact
            hint="Small square image shown in the browser tab."
          />
        </div>
      </SectionCard>

      <SectionCard title="Headline & introduction" description="The first thing a visitor reads.">
        <div className="space-y-4">
          <Field label="Main headline">
            <TextArea value={draft.hero_headline || ""} onChange={(event) => set("hero_headline", event.target.value)} rows={2} maxLength={200} />
          </Field>
          <Field label="Short business introduction">
            <TextArea
              value={draft.hero_subheadline || ""}
              onChange={(event) => set("hero_subheadline", event.target.value)}
              rows={3}
              maxLength={400}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Brand colours" description="Applied across buttons, links, accents and highlights.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ColorField label="Primary" value={draft.color_primary} onChange={(value) => set("color_primary", value)} />
          <ColorField label="Secondary" value={draft.color_secondary} onChange={(value) => set("color_secondary", value)} />
          <ColorField label="Background" value={draft.color_background} onChange={(value) => set("color_background", value)} />
          <ColorField label="Surface" value={draft.color_surface} onChange={(value) => set("color_surface", value)} />
        </div>
      </SectionCard>

      <SectionCard title="Contact information" description="Used in the header, footer, contact page and store information.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <TextInput value={draft.phone || ""} onChange={(event) => set("phone", event.target.value)} maxLength={40} />
          </Field>
          <Field label="Email">
            <TextInput value={draft.email || ""} onChange={(event) => set("email", event.target.value)} maxLength={120} />
          </Field>
          <Field label="Street address">
            <TextInput value={draft.address_line1 || ""} onChange={(event) => set("address_line1", event.target.value)} maxLength={120} />
          </Field>
          <Field label="Suite / unit (optional)">
            <TextInput value={draft.address_line2 || ""} onChange={(event) => set("address_line2", event.target.value)} maxLength={80} />
          </Field>
          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <Field label="City">
              <TextInput value={draft.city || ""} onChange={(event) => set("city", event.target.value)} maxLength={60} />
            </Field>
            <Field label="State">
              <TextInput value={draft.state || ""} onChange={(event) => set("state", event.target.value)} maxLength={40} />
            </Field>
            <Field label="ZIP / postal">
              <TextInput value={draft.postal_code || ""} onChange={(event) => set("postal_code", event.target.value)} maxLength={20} />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Business hours" description="Shown on the homepage, store page, contact page and footer.">
        <HoursEditor label="Weekly hours" value={draft.hours} onChange={(rows) => set("hours", rows)} fields={HOURS_FIELDS} addLabel="Add day" />
      </SectionCard>

      <SaveBar onSave={() => save()} saving={saving} />
    </div>
  );
}