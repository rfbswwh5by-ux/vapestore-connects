export default function StatCard({ label, value, hint }) {
  return (
    <div
      className="p-5"
      style={{
        backgroundColor: "var(--brand-surface)",
        border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
        borderRadius: "var(--brand-radius)",
      }}
    >
      <p className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
        {label}
      </p>
      <p className="mt-3 font-heading text-[26px] font-medium leading-none">{value}</p>
      {hint ? (
        <p className="mt-2 text-[11px]" style={{ color: "var(--brand-muted)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}