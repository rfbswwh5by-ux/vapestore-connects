import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, Trash2 } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { TextInput } from "@/components/admin/Field";

export default function TeamMemberCard({ member, canManage, isSelf, onChanged }) {
  const { api } = useAdmin();
  const [resetting, setResetting] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(false);
  const isOwnerRow = member.role === "owner";

  const reset = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api("resetTeamCode", { id: member.id, code });
      if (res?.ok) {
        toast.success(`New code saved for ${member.name}. Their old code no longer works.`);
        setCode("");
        setResetting(false);
        onChanged();
      } else {
        toast.error(res?.error || "Could not change that code.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const res = await api("removeTeamMember", { id: member.id });
    if (res?.ok) {
      toast.success(`${member.name} no longer has access.`);
      onChanged();
    } else {
      toast.error(res?.error || "Could not remove that person.");
    }
    setPendingRemove(false);
  };

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "color-mix(in srgb, var(--brand-ink) 4%, transparent)",
        border: "1px solid color-mix(in srgb, var(--brand-ink) 8%, transparent)",
        borderRadius: "var(--brand-radius)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
            {member.name}
            <span
              className="px-2 py-0.5 font-mono text-[9px] uppercase"
              style={{
                letterSpacing: "0.14em",
                borderRadius: 999,
                color: isOwnerRow ? "var(--brand-primary)" : "var(--brand-muted)",
                border: `1px solid ${isOwnerRow ? "var(--brand-primary)" : "color-mix(in srgb, var(--brand-ink) 20%, transparent)"}`,
              }}
            >
              {isOwnerRow ? "Owner" : "Team member"}
            </span>
            {isSelf ? (
              <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.14em", color: "var(--brand-muted)" }}>
                You
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--brand-muted)" }}>
            {member.last_used_ms
              ? `Last opened ${new Date(member.last_used_ms).toLocaleString("en-US", { month: "short", day: "numeric" })}`
              : "Has not opened the dashboard yet"}
            {isOwnerRow ? " · Cannot be removed" : ""}
          </p>
        </div>

        {canManage && isOwnerRow ? null : canManage ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setResetting((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase hover:opacity-70"
              style={{
                letterSpacing: "0.12em",
                border: "1px solid color-mix(in srgb, var(--brand-ink) 16%, transparent)",
                borderRadius: "var(--brand-radius)",
                color: "var(--brand-muted)",
              }}
            >
              <KeyRound size={11} /> New code
            </button>
            <button
              type="button"
              onClick={() => setPendingRemove(true)}
              aria-label={`Remove ${member.name}`}
              className="p-2 hover:opacity-70"
              style={{ color: "#fda4af" }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : null}
      </div>

      {resetting ? (
        <form onSubmit={reset} className="mt-4 flex flex-wrap items-end gap-2">
          <TextInput
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="New code for them"
            className="max-w-[240px] font-mono"
            autoComplete="off"
          />
          <button type="submit" disabled={saving || code.length < 8} className="btn-brand !px-4 !py-2.5 disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
            Save
          </button>
        </form>
      ) : null}

      <ConfirmDialog
        open={pendingRemove}
        onOpenChange={(open) => !open && setPendingRemove(false)}
        title={`Remove ${member.name}?`}
        description="Their code stops working and any open dashboard session ends immediately. You can add them again with a new code."
        onConfirm={remove}
      />
    </div>
  );
}