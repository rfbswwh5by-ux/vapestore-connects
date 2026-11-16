export default function SectionLabel({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1" style={{ backgroundColor: "color-mix(in srgb, var(--brand-ink) 12%, transparent)" }} />
    </div>
  );
}