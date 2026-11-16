import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAdmin } from "@/lib/AdminContext";
import Field, { TextArea, TextInput, Toggle } from "@/components/admin/Field";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export const Route = createFileRoute("/admin/faq")({
  component: FaqAdminPage,
});

const EMPTY = { question: "", answer: "", is_visible: true };

function FaqAdminPage() {
  const { api } = useAdmin();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    const res = await api("listFaqs");
    setFaqs(res?.ok ? res.faqs : []);
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

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({ ...EMPTY, ...faq });
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await api("saveFaq", { ...form, id: editing?.id });
    setSaving(false);
    if (res?.ok) {
      toast.success(editing?.id ? "Question updated." : "Question added.");
      setEditorOpen(false);
      load();
    } else {
      toast.error(res?.error || "Could not save that question.");
    }
  };

  const move = async (index, direction) => {
    const next = [...faqs];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFaqs(next);
    const res = await api("reorderFaqs", { ids: next.map((row) => row.id) });
    if (!res?.ok) toast.error("Could not save the new order.");
  };

  const toggleVisible = async (faq) => {
    const res = await api("saveFaq", { ...faq, id: faq.id, is_visible: !faq.is_visible });
    if (res?.ok) setFaqs((prev) => prev.map((row) => (row.id === faq.id ? { ...row, is_visible: !row.is_visible } : row)));
    else toast.error(res?.error || "Could not update that question.");
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const res = await api("deleteFaq", { id: pendingDelete.id });
    if (res?.ok) {
      setFaqs((prev) => prev.filter((row) => row.id !== pendingDelete.id));
      toast.success("Question deleted.");
    } else {
      toast.error(res?.error || "Could not delete that question.");
    }
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">FAQ</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            Answer the questions you get asked at the counter. Order them however you like.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-brand !px-5 !py-2.5">
          <Plus size={14} /> Add question
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
            Loading questions…
          </p>
        ) : faqs.length ? (
          faqs.map((faq, index) => (
            <div key={faq.id} className="flex items-start gap-3 px-4 py-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 7%, transparent)" }}>
              <div className="flex flex-col pt-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="p-0.5 disabled:opacity-25">
                  <ArrowUp size={12} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === faqs.length - 1} aria-label="Move down" className="p-0.5 disabled:opacity-25">
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{faq.question}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                  {faq.answer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisible(faq)}
                aria-label={faq.is_visible ? "Hide question" : "Publish question"}
                className="mt-1 p-1 hover:opacity-70"
                style={{ color: faq.is_visible ? "#4ade80" : "var(--brand-muted)" }}
              >
                {faq.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button type="button" onClick={() => openEdit(faq)} aria-label="Edit question" className="mt-1 p-1 hover:opacity-70">
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(faq)}
                aria-label="Delete question"
                className="mt-1 p-1 hover:opacity-70"
                style={{ color: "#fda4af" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="px-4 py-14 text-center text-[13px]" style={{ color: "var(--brand-muted)" }}>
            No questions yet. Add the ones customers actually ask.
          </p>
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="border-0 p-0 sm:max-w-lg" style={{ backgroundColor: "var(--brand-bg)", borderRadius: 0 }}>
          <div className="border-b px-6 py-5" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <DialogTitle className="text-[17px] font-medium">{editing?.id ? "Edit question" : "Add question"}</DialogTitle>
          </div>
          <div className="space-y-4 px-6 py-5">
            <Field label="Question">
              <TextInput value={form.question} onChange={(event) => set("question", event.target.value)} maxLength={300} />
            </Field>
            <Field label="Answer" hint="Leave a blank line between paragraphs.">
              <TextArea value={form.answer} onChange={(event) => set("answer", event.target.value)} rows={7} maxLength={4000} />
            </Field>
            <Toggle label="Show on the website" checked={form.is_visible} onChange={(value) => set("is_visible", value)} />
          </div>
          <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
            <button type="button" onClick={() => setEditorOpen(false)} className="btn-ghost-brand !px-4 !py-2">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving || !form.question.trim()} className="btn-brand !px-5 !py-2 disabled:opacity-50">
              {editing?.id ? "Save changes" : "Add question"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this question?"
        description="It will disappear from the public FAQ page immediately."
        onConfirm={remove}
      />
    </div>
  );
}