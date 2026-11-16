import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, X } from "lucide-react";

export default function ImageUpload({ label, value, onChange, hint, aspect = "aspect-[16/10]", compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Choose an image under 8 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(res.file_url);
    } catch {
      setError("That upload didn't go through. Try a JPG or PNG under 8 MB.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
          {label}
        </span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-[10px] uppercase hover:opacity-70"
            style={{ letterSpacing: "0.1em", color: "var(--brand-muted)" }}
          >
            <X size={11} /> Remove
          </button>
        ) : null}
      </div>

      <label
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden ${compact ? "aspect-[3/1]" : aspect}`}
        style={{
          backgroundColor: "color-mix(in srgb, var(--brand-ink) 4%, transparent)",
          border: "1px dashed color-mix(in srgb, var(--brand-ink) 18%, transparent)",
          borderRadius: "var(--brand-radius)",
        }}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-[11px]" style={{ color: "var(--brand-muted)" }}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} strokeWidth={1.5} />}
            {busy ? "Uploading" : "Upload image"}
          </span>
        )}
        {value && busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
          </span>
        ) : null}
        <input type="file" accept="image/*" onChange={pick} className="absolute inset-0 cursor-pointer opacity-0" disabled={busy} />
      </label>

      {hint ? (
        <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          {hint}
        </p>
      ) : null}
      {error ? <p className="mt-1.5 text-[11px]" style={{ color: "#fda4af" }}>{error}</p> : null}
    </div>
  );
}