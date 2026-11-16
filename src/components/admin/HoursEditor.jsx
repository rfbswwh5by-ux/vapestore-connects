import { Plus, Trash2 } from "lucide-react";
import { TextInput } from "@/components/admin/Field";

export function HoursEditor({ label, value = [], onChange, fields, addLabel }) {
  const rows = Array.isArray(value) ? value : [];

  const update = (index, key, next) => {
    const copy = rows.map((row, i) => (i === index ? { ...row, [key]: next } : row));
    onChange(copy);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => onChange([...rows, fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})])}
          className="flex items-center gap-1 font-mono text-[10px] uppercase hover:opacity-70"
          style={{ letterSpacing: "0.1em", color: "var(--brand-primary)" }}
        >
          <Plus size={11} /> {addLabel}
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            {fields.map((field) => (
              <TextInput
                key={field.key}
                value={row[field.key] || ""}
                onChange={(event) => update(index, field.key, event.target.value)}
                placeholder={field.placeholder}
                className={field.wide ? "flex-[1.4]" : "flex-1"}
                maxLength={120}
              />
            ))}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              aria-label="Remove row"
              className="shrink-0 p-2 hover:opacity-70"
              style={{ color: "var(--brand-muted)" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {!rows.length ? (
          <p className="text-[11px]" style={{ color: "var(--brand-muted)" }}>
            Nothing added yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export const HOURS_FIELDS = [
  { key: "day", placeholder: "Day", wide: false },
  { key: "hours", placeholder: "10:00 AM — 8:00 PM", wide: true },
];

export const HOLIDAY_FIELDS = [
  { key: "label", placeholder: "Thanksgiving Day", wide: true },
  { key: "hours", placeholder: "Closed", wide: false },
];