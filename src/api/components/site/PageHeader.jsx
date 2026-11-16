export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="border-b px-6 pb-14 pt-32 lg:px-10 lg:pb-20 lg:pt-40" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
      <div className="mx-auto max-w-[1400px]">
        {eyebrow ? <p className="eyebrow fade-up">{eyebrow}</p> : null}
        <h1 className="fade-up mt-5 max-w-4xl text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[0.98]">
          {title}
        </h1>
        {description ? (
          <p className="fade-up mt-6 max-w-2xl text-base leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}