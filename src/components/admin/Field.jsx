export default function Field({ label, hint, children, className = "" }) {
  return (
    <div className={className}>
      <span className="mb-2 block font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input {...props} className={`field ${className}`} />;
}

export function TextArea({ className = "", rows = 4, ...props }) {
  return <textarea rows={rows} {...props} className={`field resize-y ${className}`} />;
}

export function SelectInput({ options = [], className = "", ...props }) {
  return (
    <select {...props} className={`field ${className}`}>
      {options.map((option) => (
        <option key={option.value} value={option.value} style={{ backgroundColor: "#111" }}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-[13px]" style={{ color: "var(--brand-ink)" }}>
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--brand-muted)" }}>
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 transition-colors"
        style={{
          borderRadius: 999,
          backgroundColor: checked ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 18%, transparent)",
        }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform"
          style={{ transform: `translateX(${checked ? 22 : 2}px)`, backgroundColor: "#050505" }}
        />
      </button>
    </div>
  );
}

export function SectionCard({ title, description, children, actions }) {
  return (
    <section
      className="p-5 sm:p-6"
      style={{
        backgroundColor: "var(--brand-surface)",
        border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
        borderRadius: "var(--brand-radius)",
      }}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-[15px] font-medium">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-xl text-[12px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}