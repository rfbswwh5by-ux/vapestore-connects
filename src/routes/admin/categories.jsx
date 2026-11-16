import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdmin } from "@/lib/AdminContext";
import Field, { SelectInput, TextArea, TextInput, Toggle } from "@/components/admin/Field";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdminPage,
});

const EMPTY = { name: "", description: "", image_url: "", is_visible: true };

function CategoriesAdminPage() {
  const { api } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteMode, setDeleteMode] = useState("keep");

  const load = async () => {
    const res = await api("listCategories");
    setCategories(res?.ok ? res.categories : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setEditorOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({ ...EMPTY, ...category });
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await api("saveCategory", { ...form, id: editing?.id });
    setSaving(false);
    if (res?.ok) {
      toast.success(editing?.id ? "Category updated." : "Category created.");
      setEditorOpen(false);
      load();
    } else {
      toast.error(res?.error || "Could not save that category.");
    }
  };

  const move = async (index, direction) => {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    const res = await api("reorderCategories", { ids: next.map((row) => row.id) });
    if (!res?.ok) toast.error("Could not save the new order.");
  };

  const toggleVisible = async (category) => {
    const res = await api("saveCategory", { ...category, id: category.id, is_visible: !category.is_visible });
    if (res?.ok) {
      setCategories((prev) => prev.map((row) => (row.id === category.id ? { ...row, is_visible: !row.is_visible } : row)));
    } else {
      toast.error(res?.error || "Could not update that category.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const res = await api("deleteCategory", { id: pendingDelete.id, mode: deleteMode });
    if (res?.ok) {
      toast.success("Category deleted.");
      setPendingDelete(null);
      load();
    } else {
      toast.error(res?.error || "Could not delete that category.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Categories</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            The sections visitors browse by. Rename, reorder, hide or remove them at any time — products follow their
            category.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-brand !px-5 !py-2.5">
          <Plus size={14} /> Add category
        </button>
      </div>

      <div
        className="divide-y"
        style={{
          backgroundColor: "var(--brand-surface)",
          border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
          borderRadius: "var(--brand-radius)",
        }}
      >
        {loading ? (
          <p className="px-4 py-10 text-center text-[13px]" style={{ color: "var(--brand-muted)" }}>
            Loading categories…
          </p>
        ) : categories.length ? (
          categories.map((category, index) => (
            <div key={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 7%, transparent)" }}>
              <div className="flex flex-col">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="p-0.5 disabled:opacity-25">
                  <ArrowUp size={12} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === categories.length - 1} aria-label="Move down" className="p-0.5 disabled:opacity-25">
                  <ArrowDown size={12} />
                </button>
              </div>

              <div className="h-10 w-10 shrink-0 overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--brand-ink) 6%, transparent)" }}>
                {category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px]">{category.name}</p>
                <p className="truncate font-mono text-[10px]" style={{ color: "var(--brand-muted)" }}>
                  /{category.slug || "category"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleVisible(category)}
                className="flex items-center gap-1.5 font-mono text-[9px] uppercase"
                style={{ letterSpacing: "0.12em", color: category.is_visible ? "#4ade80" : "var(--brand-muted)" }}
              >
                {category.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                {category.is_visible ? "Shown" : "Hidden"}
              </button>

              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openEdit(category)} aria-label="Edit category" className="p-2 hover:opacity-70">
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteMode("keep");
                    setPendingDelete(category);
                  }}
                  aria-label="Delete category"
                  className="p-2 hover:opacity-70"
                  style={{ color: "#fda4af" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="px-4 py-14 text-center text-[13px]" style={{ color: "var(--brand-muted)" }}>
            No categories yet. Add the sections you want customers to browse.
          </p>
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="border-0 p-0 sm:max-w-lg" style={{ backgroundColor: "var(--brand-bg)", borderRadius: 0 }}>
          <div className="border-b px-6 py-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <DialogTitle className="text-[17px] font-medium">{editing?.id ? "Edit category" : "Add category"}</DialogTitle>
          </div>
          <div className="space-y-4 px-6 py-5">
            <Field label="Category name">
              <TextInput value={form.name} onChange={(event) => set("name", event.target.value)} maxLength={120} />
            </Field>
            <Field label="Short description" hint="Shown at the top of the category page.">
              <TextArea value={form.description} onChange={(event) => set("description", event.target.value)} rows={3} maxLength={600} />
            </Field>
            <ImageUpload label="Category image" value={form.image_url} onChange={(url) => set("image_url", url)} aspect="aspect-[16/9]" />
            <Toggle label="Show on the website" checked={form.is_visible} onChange={(value) => set("is_visible", value)} />
          </div>
          <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <button type="button" onClick={() => setEditorOpen(false)} className="btn-ghost-brand !px-4 !py-2">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving || !form.name.trim()} className="btn-brand !px-5 !py-2 disabled:opacity-50">
              {editing?.id ? "Save changes" : "Add category"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name || ""}"?`}
        description="Choose what happens to the products in this category."
        confirmLabel="Delete category"
        onConfirm={remove}
        extra={
          <div className="mt-4">
            <SelectInput
              value={deleteMode}
              onChange={(event) => setDeleteMode(event.target.value)}
              options={[
                { value: "keep", label: "Keep products (move to uncategorised)" },
                { value: "delete", label: "Also delete its products" },
              ]}
            />
          </div>
        }
      />
    </div>
  );
}