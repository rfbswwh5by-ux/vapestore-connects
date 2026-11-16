import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, Star, ArrowUpRight } from "lucide-react";
import { useSettingsDraft } from "@/lib/useSettingsDraft";
import { useAdmin } from "@/lib/AdminContext";
import Field, { SectionCard, TextArea, TextInput, Toggle } from "@/components/admin/Field";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar from "@/components/admin/SaveBar";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageEditorPage,
});

function HomepageEditorPage() {
  const { draft, set, save, saving } = useSettingsDraft();
  const { api } = useAdmin();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api("listProducts").then((res) => setProducts(res?.ok ? res.products : []));
  }, [api]);

  const toggleFeatured = async (product) => {
    const res = await api("saveProduct", { ...product, id: product.id, is_featured: !product.is_featured });
    if (res?.ok) {
      setProducts((prev) => prev.map((row) => (row.id === product.id ? { ...row, is_featured: !row.is_featured } : row)));
      toast.success(product.is_featured ? "Removed from homepage." : "Added to homepage.");
    } else {
      toast.error(res?.error || "Could not update that product.");
    }
  };

  const updateSection = (index, key, value) =>
    set("about_sections", draft.about_sections.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Homepage editor</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          The hero, the about section and the announcement strip. Featured products are chosen from the list at the
          bottom of this page.
        </p>
      </div>

      <SectionCard title="Hero" description="The first screen visitors see.">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Small label above headline" hint="Example: Est. 2016 — East Nashville">
              <TextInput value={draft.hero_eyebrow || ""} onChange={(event) => set("hero_eyebrow", event.target.value)} maxLength={120} />
            </Field>
            <Field label="Call to action label">
              <TextInput value={draft.banner_link_label || ""} onChange={(event) => set("banner_link_label", event.target.value)} maxLength={60} />
            </Field>
          </div>
          <Field label="Hero headline">
            <TextArea value={draft.hero_headline || ""} onChange={(event) => set("hero_headline", event.target.value)} rows={2} maxLength={200} />
          </Field>
          <Field label="Hero description">
            <TextArea value={draft.hero_subheadline || ""} onChange={(event) => set("hero_subheadline", event.target.value)} rows={3} maxLength={400} />
          </Field>
          <ImageUpload label="Hero photograph" value={draft.hero_image_url} onChange={(url) => set("hero_image_url", url)} aspect="aspect-[16/9]" />
        </div>
      </SectionCard>

      <SectionCard title="Announcement banner" description="One line, shown between the featured products and the about section.">
        <div className="space-y-4">
          <Toggle label="Show banner" checked={draft.banner_visible} onChange={(value) => set("banner_visible", value)} />
          <Field label="Banner text">
            <TextArea value={draft.banner_text || ""} onChange={(event) => set("banner_text", event.target.value)} rows={2} maxLength={300} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Link label">
              <TextInput value={draft.banner_link_label || ""} onChange={(event) => set("banner_link_label", event.target.value)} maxLength={60} />
            </Field>
            <Field label="Link destination" hint="For example /products or /contact">
              <TextInput value={draft.banner_link_url || ""} onChange={(event) => set("banner_link_url", event.target.value)} maxLength={200} />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="About section" description="A short introduction on the homepage, linked to the full about page.">
        <div className="space-y-4">
          <Field label="Heading">
            <TextInput value={draft.about_heading || ""} onChange={(event) => set("about_heading", event.target.value)} maxLength={160} />
          </Field>
          <Field label="Body" hint="Leave a blank line between paragraphs.">
            <TextArea value={draft.about_body || ""} onChange={(event) => set("about_body", event.target.value)} rows={7} maxLength={8000} />
          </Field>
          <ImageUpload label="About photograph" value={draft.about_image_url} onChange={(url) => set("about_image_url", url)} aspect="aspect-[4/3]" />
        </div>
      </SectionCard>

      <SectionCard
        title="Additional about-page sections"
        description="Extra blocks that appear on the about page."
        actions={
          <button
            type="button"
            onClick={() => set("about_sections", [...(draft.about_sections || []), { title: "", body: "" }])}
            className="flex items-center gap-1 font-mono text-[10px] uppercase hover:opacity-70"
            style={{ letterSpacing: "0.12em", color: "var(--brand-primary)" }}
          >
            <Plus size={12} /> Add section
          </button>
        }
      >
        <div className="space-y-4">
          {(draft.about_sections || []).map((section, index) => (
            <div key={index} className="border p-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: "var(--brand-muted)" }}>
                  0{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => set("about_sections", draft.about_sections.filter((_, i) => i !== index))}
                  aria-label="Remove section"
                  className="hover:opacity-70"
                  style={{ color: "#fda4af" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="space-y-3">
                <TextInput value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)} placeholder="Section heading" maxLength={120} />
                <TextArea value={section.body} onChange={(event) => updateSection(index, "body", event.target.value)} rows={3} placeholder="Section body" maxLength={2000} />
              </div>
            </div>
          ))}
          {!draft.about_sections?.length ? (
            <p className="text-[12px]" style={{ color: "var(--brand-muted)" }}>
              No extra sections.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Featured products"
        description="Star products to show them on the homepage."
        actions={
          <Link to="/admin/products" className="flex items-center gap-1 font-mono text-[10px] uppercase" style={{ letterSpacing: "0.12em", color: "var(--brand-primary)" }}>
            Manage products <ArrowUpRight size={12} />
          </Link>
        }
      >
        <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 8%, transparent)" }}>
          {products.length ? (
            products.slice(0, 12).map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px]">{product.name}</p>
                  <p className="truncate font-mono text-[10px]" style={{ color: "var(--brand-muted)" }}>
                    {product.category || "Uncategorised"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(product)}
                  aria-label={product.is_featured ? "Remove from homepage" : "Feature on homepage"}
                  style={{ color: product.is_featured ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 28%, transparent)" }}
                >
                  <Star size={15} fill={product.is_featured ? "currentColor" : "none"} />
                </button>
              </div>
            ))
          ) : (
            <p className="py-3 text-[12px]" style={{ color: "var(--brand-muted)" }}>
              Add products first.
            </p>
          )}
        </div>
      </SectionCard>

      <SaveBar onSave={() => save()} saving={saving} />
    </div>
  );
}