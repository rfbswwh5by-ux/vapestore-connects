import { createFileRoute } from "@tanstack/react-router";
import { useSettingsDraft } from "@/lib/useSettingsDraft";
import Field, { SectionCard, TextArea, TextInput } from "@/components/admin/Field";
import { HOLIDAY_FIELDS, HOURS_FIELDS, HoursEditor } from "@/components/admin/HoursEditor";
import SaveBar from "@/components/admin/SaveBar";

export const Route = createFileRoute("/admin/store")({
  component: StoreInfoPage,
});

function StoreInfoPage() {
  const { draft, set, save, saving } = useSettingsDraft();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Store information</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Address, hours, map and social links. This is what visitors use to actually find you.
        </p>
      </div>

      <SectionCard title="Address & contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street address">
            <TextInput value={draft.address_line1 || ""} onChange={(event) => set("address_line1", event.target.value)} maxLength={120} />
          </Field>
          <Field label="Suite / unit (optional)">
            <TextInput value={draft.address_line2 || ""} onChange={(event) => set("address_line2", event.target.value)} maxLength={80} />
          </Field>
          <Field label="City">
            <TextInput value={draft.city || ""} onChange={(event) => set("city", event.target.value)} maxLength={60} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <TextInput value={draft.state || ""} onChange={(event) => set("state", event.target.value)} maxLength={40} />
            </Field>
            <Field label="ZIP / postal">
              <TextInput value={draft.postal_code || ""} onChange={(event) => set("postal_code", event.target.value)} maxLength={20} />
            </Field>
          </div>
          <Field label="Phone">
            <TextInput value={draft.phone || ""} onChange={(event) => set("phone", event.target.value)} maxLength={40} />
          </Field>
          <Field label="Email">
            <TextInput value={draft.email || ""} onChange={(event) => set("email", event.target.value)} maxLength={120} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Google Maps location" description="Use the full address, or drop in a place name or coordinates.">
        <Field label="Map search query" hint="Example: 1204 Gallatin Ave, Nashville, TN 37206">
          <TextInput value={draft.maps_query || ""} onChange={(event) => set("maps_query", event.target.value)} maxLength={200} />
        </Field>
        <div className="mt-4 h-56 overflow-hidden border" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <iframe
            title="Map preview"
            src={`https://www.google.com/maps?q=${encodeURIComponent(draft.maps_query || `${draft.address_line1 || ""} ${draft.city || ""}`)}&output=embed`}
            className="h-full w-full"
            style={{ border: 0, filter: "grayscale(1) invert(0.93) contrast(0.82)" }}
            loading="lazy"
          />
        </div>
      </SectionCard>

      <SectionCard title="Hours" description="Enter one row per day. Holiday hours appear under the weekly list.">
        <div className="space-y-8">
          <HoursEditor label="Weekly hours" value={draft.hours} onChange={(rows) => set("hours", rows)} fields={HOURS_FIELDS} addLabel="Add day" />
          <HoursEditor label="Holiday hours" value={draft.holiday_hours} onChange={(rows) => set("holiday_hours", rows)} fields={HOLIDAY_FIELDS} addLabel="Add holiday" />
        </div>
      </SectionCard>

      <SectionCard title="Social media" description="Leave blank to hide an icon.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL">
            <TextInput value={draft.social_instagram || ""} onChange={(event) => set("social_instagram", event.target.value)} maxLength={200} />
          </Field>
          <Field label="Facebook URL">
            <TextInput value={draft.social_facebook || ""} onChange={(event) => set("social_facebook", event.target.value)} maxLength={200} />
          </Field>
          <Field label="TikTok URL">
            <TextInput value={draft.social_tiktok || ""} onChange={(event) => set("social_tiktok", event.target.value)} maxLength={200} />
          </Field>
          <Field label="X URL">
            <TextInput value={draft.social_x || ""} onChange={(event) => set("social_x", event.target.value)} maxLength={200} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="General store policies" description="Shown on the store information page.">
        <TextArea value={draft.store_policies || ""} onChange={(event) => set("store_policies", event.target.value)} rows={8} maxLength={8000} />
      </SectionCard>

      <SectionCard title="Footer note" description="A single line in the footer.">
        <TextInput value={draft.footer_note || ""} onChange={(event) => set("footer_note", event.target.value)} maxLength={160} />
      </SectionCard>

      <SaveBar onSave={() => save()} saving={saving} />
    </div>
  );
}