import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck, KeyRound, LogOut } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import Field, { SectionCard, TextInput } from "@/components/admin/Field";

export const Route = createFileRoute("/admin/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const { api, logout, expiresAt, role, meName } = useAdmin();
  const [form, setForm] = useState({ currentCode: "", newCode: "", confirmCode: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.newCode !== form.confirmCode) {
      setError("The new codes do not match.");
      return;
    }
    if (form.newCode.length < 8) {
      setError("Use at least 8 characters for the new code.");
      return;
    }
    setSaving(true);
    try {
      const res = await api("changeCode", { currentCode: form.currentCode, newCode: form.newCode });
      if (res?.ok) {
        toast.success("Access code updated. The previous code no longer works.");
        setForm({ currentCode: "", newCode: "", confirmCode: "" });
      } else {
        setError(res?.error || "Could not update the code.");
      }
    } catch {
      setError("Could not update the code. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Security settings</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Your own access code protects this dashboard. It is unique to this website, stored as a salted hash, and
          verified on the server for every change. Changing it never affects anyone else on the team.
        </p>
      </div>

      <SectionCard title="Change your access code" description="Your previous code stops working the moment you save.">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Current access code" className="sm:col-span-2 sm:max-w-xs">
            <TextInput
              type="password"
              value={form.currentCode}
              onChange={update("currentCode")}
              autoComplete="current-password"
              className="font-mono"
            />
          </Field>
          <Field label="New access code" hint="At least 8 characters. Longer is stronger.">
            <TextInput
              type="password"
              value={form.newCode}
              onChange={update("newCode")}
              autoComplete="new-password"
              className="font-mono"
            />
          </Field>
          <Field label="Confirm new access code">
            <TextInput
              type="password"
              value={form.confirmCode}
              onChange={update("confirmCode")}
              autoComplete="new-password"
              className="font-mono"
            />
          </Field>

          {error ? (
            <p className="text-[12px] sm:col-span-2" style={{ color: "#fda4af" }}>
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving || !form.currentCode || !form.newCode} className="btn-brand !px-5 !py-2.5 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
              {saving ? "Updating" : "Update access code"}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Current session" description="Dashboard sessions expire automatically.">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-[13px]" style={{ color: "var(--brand-muted)" }}>
            {role === "owner" ? "Signed in as the owner." : `Signed in as a team member${meName ? ` (${meName})` : ""}.`}
            <br />
            {expiresLabel ? `Signed in until ${expiresLabel}.` : "Session active."}
            <br />
            Closing the browser tab also ends the session.
          </div>
          <button type="button" onClick={logout} className="btn-ghost-brand !px-4 !py-2">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </SectionCard>

      <SectionCard title="How this is protected" description="Every administrative action is authorized on the server.">
        <ul className="space-y-3 text-[12px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          {[
            "Access codes are never stored in plain text. Only a PBKDF2-SHA256 hash with a per-site salt is kept.",
            "Every dashboard request carries a session token that is hashed in the database and expires after 8 hours.",
            "Five incorrect attempts lock the sign-in form for 15 minutes.",
            "Changing the code signs out every other session immediately.",
            "Database writes from the public site are refused; only the authenticated dashboard can change content.",
            "Each duplicated website has its own database, its own access code and its own sessions. Nothing is shared.",
          ].map((line) => (
            <li key={line} className="flex gap-3">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand-primary)" }} />
              {line}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}