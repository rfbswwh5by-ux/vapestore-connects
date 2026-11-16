export default function ColorField({ label, value, onChange, hint }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#000000";

  return (
    <div>
      <span className="mb-2 block font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
        {label}
      </span>
      <div
        className="flex items-center gap-2 px-2 py-1.5"
        style={{ border: "1px solid color-mix(in srgb, var(--brand-ink) 14%, transparent)", borderRadius: "var(--brand-radius)" }}
      >
        <label
          className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden"
          style={{ backgroundColor: safe, border: "1px solid color-mix(in srgb, var(--brand-ink) 20%, transparent)" }}
        >
          <input
            type="color"
            value={safe}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer opacity-0"
            aria-label={`${label} colour picker`}
          />
        </label>
        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent font-mono text-[12px] uppercase outline-none"
          style={{ color: "var(--brand-ink)" }}
          maxLength={7}
          aria-label={label}
        />
      </div>
      {hint ? (
        <p className="mt-1.5 text-[11px]" style={{ color: "var(--brand-muted)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}