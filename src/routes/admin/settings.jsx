import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useSettingsDraft } from "@/lib/useSettingsDraft";
import Field, { SectionCard, SelectInput, TextArea, TextInput } from "@/components/admin/Field";
import SaveBar from "@/components/admin/SaveBar";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { draft, set, save, saving } = useSettingsDraft();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">SEO & legal</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          How the site appears in search results and on social previews, plus the legal pages and age-restriction
          settings.
        </p>
      </div>

      <SectionCard title="Search & social preview" description="Shown in Google results and when the link is shared.">
        <div className="space-y-4">
          <Field label={`Page title (${(draft.meta_title || "").length}/70)`}>
            <TextInput value={draft.meta_title || ""} onChange={(event) => set("meta_title", event.target.value)} maxLength={70} />
          </Field>
          <Field label={`Meta description (${(draft.meta_description || "").length}/160)`}>
            <TextArea value={draft.meta_description || ""} onChange={(event) => set("meta_description", event.target.value)} rows={3} maxLength={160} />
          </Field>
          <div className="border p-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <p className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.2em", color: "var(--brand-muted)" }}>
              Google preview
            </p>
            <p className="mt-3 text-[13px]" style={{ color: "#a78bfa" }}>
              {draft.meta_title || draft.business_name}
            </p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--brand-muted)" }}>
              {draft.meta_description || "Add a meta description so search results show the right summary."}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Age restriction"
        description="The age gate is always active and cannot be switched off. You can adjust the wording and the minimum age for your jurisdiction."
      >
        <div className="mb-4 flex items-start gap-3 border p-3" style={{ borderColor: "color-mix(in srgb, var(--brand-primary) 30%, transparent)" }}>
          <Lock size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand-primary)" }} />
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            Every visitor sees the verification screen before any age-restricted content loads. An affirmative answer is
            remembered for that browser session only, and expires when the session ends.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum age">
            <SelectInput
              value={String(draft.age_minimum || 21)}
              onChange={(event) => set("age_minimum", Number(event.target.value))}
              options={[
                { value: "18", label: "18" },
                { value: "19", label: "19" },
                { value: "21", label: "21" },
              ]}
            />
          </Field>
          <Field label="Verification method">
            <SelectInput
              value={draft.age_verification_mode}
              onChange={(event) => set("age_verification_mode", event.target.value)}
              options={[
                { value: "self_attest", label: "Self-attestation (standard)" },
                { value: "third_party", label: "Third-party verification provider" },
              ]}
            />
          </Field>
          {draft.age_verification_mode === "third_party" ? (
            <>
              <Field label="Provider name">
                <TextInput value={draft.age_provider_name || ""} onChange={(event) => set("age_provider_name", event.target.value)} maxLength={80} />
              </Field>
              <Field label="Provider URL" hint="Visitors are sent here to verify, then returned to the site.">
                <TextInput value={draft.age_provider_url || ""} onChange={(event) => set("age_provider_url", event.target.value)} maxLength={400} />
              </Field>
            </>
          ) : null}
          <Field label="Gate heading" className="sm:col-span-2">
            <TextInput value={draft.age_gate_title || ""} onChange={(event) => set("age_gate_title", event.target.value)} maxLength={120} />
          </Field>
          <Field label="Gate explanation" className="sm:col-span-2">
            <TextArea value={draft.age_gate_message || ""} onChange={(event) => set("age_gate_message", event.target.value)} rows={3} maxLength={400} />
          </Field>
          <Field label="Message shown when declined" className="sm:col-span-2">
            <TextArea value={draft.age_denied_message || ""} onChange={(event) => set("age_denied_message", event.target.value)} rows={3} maxLength={400} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Privacy policy" description="Shown at /privacy. Leave a blank line between paragraphs.">
        <TextArea value={draft.privacy_policy || ""} onChange={(event) => set("privacy_policy", event.target.value)} rows={10} maxLength={20000} />
      </SectionCard>

      <SectionCard title="Terms & conditions" description="Shown at /terms.">
        <TextArea value={draft.terms_conditions || ""} onChange={(event) => set("terms_conditions", event.target.value)} rows={10} maxLength={20000} />
      </SectionCard>

      <SectionCard title="Compliance notice" description="Appears at the foot of the legal and store pages.">
        <TextArea value={draft.compliance_notice || ""} onChange={(event) => set("compliance_notice", event.target.value)} rows={4} maxLength={2000} />
      </SectionCard>

      <SaveBar onSave={() => save()} saving={saving} />
    </div>
  );
}