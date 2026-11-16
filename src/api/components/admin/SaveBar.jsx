import { Check, Loader2 } from "lucide-react";

export default function SaveBar({ onSave, saving, note = "Changes appear on the public site the moment you save." }) {
  return (
    <div
      className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 lg:-mx-8 lg:px-8"
      style={{
        backgroundColor: "color-mix(in srgb, var(--brand-bg) 92%, transparent)",
        backdropFilter: "blur(14px)",
        borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)",
      }}
    >
      <p className="text-[11px]" style={{ color: "var(--brand-muted)" }}>
        {note}
      </p>
      <button type="button" onClick={onSave} disabled={saving} className="btn-brand !px-5 !py-2.5 disabled:opacity-60">
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} strokeWidth={2.5} />}
        {saving ? "Saving" : "Save changes"}
      </button>
    </div>
  );
}