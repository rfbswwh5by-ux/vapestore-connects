import { useState } from "react";
import { Loader2, UserPlus, Wand2 } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import Field, { TextInput } from "@/components/admin/Field";

const WORDS = ["Ember", "Falcon", "Cedar", "Harbor", "Cobalt", "Willow", "Amber", "North"];

function suggestCode() {
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${pick()}-${pick()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function AddTeamMemberForm({ onAdded }) {
  const { api } = useAdmin();
  const [form, setForm] = useState({ name: "", code: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const fillSuggested = () => {
    const code = suggestCode();
    setForm((prev) => ({ ...prev, code, confirm: code }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.code !== form.confirm) {
      setError("The two codes do not match.");
      return;
    }
    if (form.code.length < 8) {
      setError("Use at least 8 characters for the code.");
      return;
    }
    setSaving(true);
    try {
      const res = await api("addTeamMember", { name: form.name, code: form.code });
      if (res?.ok) {
        onAdded({ name: form.name.trim(), code: form.code });
        setForm({ name: "", code: "", confirm: "" });
      } else {
        setError(res?.error || "Could not add that person.");
      }
    } catch {
      setError("Could not add that person. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Their name" hint="So you know whose code this is, e.g. Jordan at the counter.">
        <TextInput value={form.name} onChange={update("name")} placeholder="Jordan" autoComplete="off" />
      </Field>
      <Field label="Their access code" hint="At least 8 characters. They can change it later.">
        <TextInput
          value={form.code}
          onChange={update("code")}
          className="font-mono"
          autoComplete="off"
          placeholder="Cedar-Harbor-4821"
        />
      </Field>
      <Field label="Repeat their code" className="sm:col-span-2 sm:max-w-xs">
        <TextInput value={form.confirm} onChange={update("confirm")} className="font-mono" autoComplete="off" />
      </Field>

      {error ? (
        <p className="text-[12px] sm:col-span-2" style={{ color: "#fda4af" }}>
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={saving || !form.name || !form.code} className="btn-brand !px-5 !py-2.5 disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          {saving ? "Adding" : "Add this person"}
        </button>
        <button type="button" onClick={fillSuggested} className="btn-ghost-brand !px-4 !py-2">
          <Wand2 size={13} /> Suggest a code
        </button>
      </div>
    </form>
  );
}