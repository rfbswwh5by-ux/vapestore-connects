import { useEffect, useState } from "react";
import { useSite } from "@/lib/SiteContext";

export default function HoursTable({ compact = false, includeHoliday = false }) {
  const site = useSite();
  const [todayIndex, setTodayIndex] = useState(-1);

  useEffect(() => {
    setTodayIndex((new Date().getDay() + 6) % 7);
  }, []);

  return (
    <div>
      <ul className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
        {site.hours.map((entry, index) => {
          const isToday = index === todayIndex;
          return (
            <li
              key={`${entry.day}-${index}`}
              className={`flex items-baseline justify-between gap-4 ${compact ? "py-2" : "py-3"}`}
              style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}
            >
              <span className="text-sm" style={{ color: isToday ? "var(--brand-ink)" : "var(--brand-muted)" }}>
                {entry.day}
                {isToday ? (
                  <span className="ml-2 font-mono text-[9px] uppercase" style={{ letterSpacing: "0.18em", color: "var(--brand-primary)" }}>
                    Today
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-[11px]" style={{ color: isToday ? "var(--brand-primary)" : "var(--brand-ink)" }}>
                {entry.hours}
              </span>
            </li>
          );
        })}
      </ul>

      {includeHoliday && site.holiday_hours?.length ? (
        <div className="mt-8">
          <p className="eyebrow">Holiday hours</p>
          <ul className="mt-3 space-y-2">
            {site.holiday_hours.map((entry, index) => (
              <li key={`${entry.label}-${index}`} className="flex items-baseline justify-between gap-4">
                <span className="text-sm" style={{ color: "var(--brand-muted)" }}>
                  {entry.label}
                </span>
                <span className="font-mono text-[11px]" style={{ color: "var(--brand-ink)" }}>
                  {entry.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}