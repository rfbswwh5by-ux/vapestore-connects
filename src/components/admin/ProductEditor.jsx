import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Field, { SelectInput, TextArea, TextInput, Toggle } from "@/components/admin/Field";
import ImageUpload from "@/components/admin/ImageUpload";
import { AVAILABILITY_OPTIONS } from "@/lib/catalog";

const EMPTY = {
  name: "",
  brand: "",
  category: "",
  description: "",
  image_url: "",
  price_display: "",
  availability: "in_stock",
  specs: [],
  is_visible: true,
  is_featured: false,
  sort_order: 0,
};

export default function ProductEditor({ open, onOpenChange, product, categories, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm({ ...EMPTY, ...(product || {}), specs: product?.specs || [] });
  }, [open, product]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateSpec = (index, key, value) =>
    setForm((prev) => ({ ...prev, specs: prev.specs.map((row, i) => (i === index ? { ...row, [key]: value } : row)) }));

  const categoryOptions = [
    { value: "", label: "Uncategorised" },
    ...categories.map((category) => ({ value: category.name, label: category.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto border-0 p-0 sm:max-w-2xl"
        style={{ backgroundColor: "var(--brand-bg)", borderRadius: 0 }}
      >
        <div className="border-b px-6 py-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <DialogTitle className="text-[17px] font-medium">{product?.id ? "Edit product" : "Add product"}</DialogTitle>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <TextInput value={form.name} onChange={(event) => set("name", event.target.value)} maxLength={160} />
            </Field>
            <Field label="Brand">
              <TextInput value={form.brand} onChange={(event) => set("brand", event.target.value)} maxLength={120} />
            </Field>
            <Field label="Category">
              <SelectInput value={form.category} onChange={(event) => set("category", event.target.value)} options={categoryOptions} />
            </Field>
            <Field label="Displayed price" hint="Optional. Shown as text, e.g. $24.99 or From $18.">
              <TextInput value={form.price_display} onChange={(event) => set("price_display", event.target.value)} maxLength={40} />
            </Field>
            <Field label="Availability">
              <SelectInput value={form.availability} onChange={(event) => set("availability", event.target.value)} options={AVAILABILITY_OPTIONS} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first.">
              <TextInput
                type="number"
                value={form.sort_order}
                onChange={(event) => set("sort_order", Number(event.target.value))}
              />
            </Field>
          </div>

          <ImageUpload label="Product photograph" value={form.image_url} onChange={(url) => set("image_url", url)} aspect="aspect-[4/3]" />

          <Field label="Description">
            <TextArea value={form.description} onChange={(event) => set("description", event.target.value)} rows={4} maxLength={4000} />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                Specifications (optional)
              </span>
              <button
                type="button"
                onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}
                className="flex items-center gap-1 font-mono text-[10px] uppercase hover:opacity-70"
                style={{ letterSpacing: "0.1em", color: "var(--brand-primary)" }}
              >
                <Plus size={11} /> Add row
              </button>
            </div>
            <div className="space-y-2">
              {form.specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextInput value={spec.label} onChange={(event) => updateSpec(index, "label", event.target.value)} placeholder="Battery" className="flex-1" />
                  <TextInput value={spec.value} onChange={(event) => updateSpec(index, "value", event.target.value)} placeholder="1,100 mAh" className="flex-1" />
                  <button
                    type="button"
                    onClick={() => set("specs", form.specs.filter((_, i) => i !== index))}
                    aria-label="Remove specification"
                    className="shrink-0 p-2 hover:opacity-70"
                    style={{ color: "var(--brand-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y border-t" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
            <Toggle label="Visible on the website" description="Turn off to hide without deleting." checked={form.is_visible} onChange={(value) => set("is_visible", value)} />
            <Toggle label="Feature on the homepage" checked={form.is_featured} onChange={(value) => set("is_featured", value)} />
          </div>
        </div>

        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ backgroundColor: "var(--brand-bg)", borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}
        >
          <button type="button" onClick={() => onOpenChange(false)} className="btn-ghost-brand !px-4 !py-2">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)} disabled={saving || !form.name.trim()} className="btn-brand !px-5 !py-2 disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {saving ? "Saving" : product?.id ? "Save changes" : "Add product"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}