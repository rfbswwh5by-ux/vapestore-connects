import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import ProductEditor from "@/components/admin/ProductEditor";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AVAILABILITY_LABELS } from "@/lib/catalog";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
});

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "featured", label: "Featured" },
];

function ProductsAdminPage() {
  const { api } = useAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    const [productRes, categoryRes] = await Promise.all([api("listProducts"), api("listCategories")]);
    setProducts(productRes?.ok ? productRes.products : []);
    setCategories(categoryRes?.ok ? categoryRes.categories : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTerm =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && product.is_visible) ||
        (filter === "hidden" && !product.is_visible) ||
        (filter === "featured" && product.is_featured);
      return matchesTerm && matchesFilter;
    });
  }, [products, query, filter]);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setEditorOpen(true);
  };

  const save = async (values) => {
    setSaving(true);
    const res = await api("saveProduct", { ...values, id: editing?.id });
    setSaving(false);
    if (res?.ok) {
      toast.success(editing?.id ? "Product updated." : "Product added.");
      setEditorOpen(false);
      setEditing(null);
      load();
    } else {
      toast.error(res?.error || "Could not save that product.");
    }
  };

  const quickToggle = async (product, key) => {
    const res = await api("saveProduct", { ...product, id: product.id, [key]: !product[key] });
    if (res?.ok) {
      setProducts((prev) => prev.map((row) => (row.id === product.id ? { ...row, [key]: !row[key] } : row)));
    } else {
      toast.error(res?.error || "Could not update that product.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const res = await api("deleteProduct", { id: pendingDelete.id });
    if (res?.ok) {
      setProducts((prev) => prev.filter((row) => row.id !== pendingDelete.id));
      toast.success("Product deleted.");
    } else {
      toast.error(res?.error || "Could not delete that product.");
    }
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Products</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            Add, edit, hide or remove anything in the catalog. Categories are managed separately.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-brand !px-5 !py-2.5">
          <Plus size={14} /> Add product
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className="px-3 py-1.5 font-mono text-[10px] uppercase transition-colors"
              style={{
                letterSpacing: "0.14em",
                borderRadius: "var(--brand-radius)",
                border: "1px solid",
                borderColor: filter === item.value ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 14%, transparent)",
                color: filter === item.value ? "var(--brand-primary)" : "var(--brand-muted)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border px-3 py-2 sm:w-64" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 14%, transparent)", borderRadius: "var(--brand-radius)" }}>
          <Search size={14} style={{ color: "var(--brand-muted)" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-[13px] outline-none"
            style={{ color: "var(--brand-ink)" }}
          />
        </div>
      </div>

      <div
        className="overflow-x-auto"
        style={{
          backgroundColor: "var(--brand-surface)",
          border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
          borderRadius: "var(--brand-radius)",
        }}
      >
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
              {["Product", "Category", "Price", "Availability", "Featured", "Visible", ""].map((heading) => (
                <th key={heading} className="px-4 py-3 font-mono text-[9px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-muted)" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px]" style={{ color: "var(--brand-muted)" }}>
                  Loading products…
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((product) => (
                <tr key={product.id} className="border-b last:border-0" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 7%, transparent)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--brand-ink) 6%, transparent)" }}>
                        {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px]">{product.name}</p>
                        {product.brand ? (
                          <p className="truncate font-mono text-[10px]" style={{ color: "var(--brand-muted)" }}>
                            {product.brand}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "var(--brand-muted)" }}>
                    {product.category || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{product.price_display || "—"}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: "var(--brand-muted)" }}>
                    {AVAILABILITY_LABELS[product.availability] || "In stock"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => quickToggle(product, "is_featured")}
                      aria-label={product.is_featured ? "Remove from featured" : "Mark as featured"}
                      style={{ color: product.is_featured ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 28%, transparent)" }}
                    >
                      <Star size={15} fill={product.is_featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => quickToggle(product, "is_visible")}
                      aria-label={product.is_visible ? "Hide product" : "Publish product"}
                      className="flex items-center gap-1.5 font-mono text-[9px] uppercase"
                      style={{ letterSpacing: "0.12em", color: product.is_visible ? "#4ade80" : "var(--brand-muted)" }}
                    >
                      {product.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      {product.is_visible ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEdit(product)} aria-label="Edit product" className="p-2 hover:opacity-70">
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(product)}
                        aria-label="Delete product"
                        className="p-2 hover:opacity-70"
                        style={{ color: "#fda4af" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-[13px]" style={{ color: "var(--brand-muted)" }}>
                  No products match. Add your first product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductEditor
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditing(null);
        }}
        product={editing}
        categories={categories}
        onSave={save}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name || ""}"?`}
        description="This permanently removes the product from the catalog and the public website. It cannot be undone."
        onConfirm={remove}
      />
    </div>
  );
}