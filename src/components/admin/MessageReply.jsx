import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import { TextArea } from "@/components/admin/Field";

export default function MessageReply({ message, onReplied }) {
  const { api } = useAdmin();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async (event) => {
    event.preventDefault();
    setError("");
    if (!body.trim()) {
      setError("Write your reply first.");
      return;
    }
    setSending(true);
    try {
      const res = await api("replyMessage", { id: message.id, replyBody: body });
      if (res?.ok) {
        onReplied(res.message || { ...message, reply_text: body.trim(), replied_at_ms: Date.now(), is_read: true });
        setBody("");
        setOpen(false);
        if (res.emailed) toast.success(`Reply emailed to ${message.email}.`);
        else if (res.reason === "no-email") toast.success("Reply saved. This inquiry left no email, so call or text them.");
        else toast.warning("Reply saved. Email sending is not available yet, so send it from your own email.");
      } else {
        setError(res?.error || "Could not send that reply.");
      }
    } catch {
      setError("Could not send that reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const repliedLabel = message.replied_at_ms
    ? new Date(message.replied_at_ms).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
      {message.reply_text ? (
        <div
          className="mb-3 p-3.5"
          style={{
            backgroundColor: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
            borderRadius: "var(--brand-radius)",
          }}
        >
          <p className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-primary)" }}>
            Your reply{repliedLabel ? ` · ${repliedLabel}` : ""}
            {message.reply_by ? ` · ${message.reply_by}` : ""}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed" style={{ color: "var(--brand-ink)" }}>
            {message.reply_text}
          </p>
        </div>
      ) : null}

      {open ? (
        <form onSubmit={send}>
          <TextArea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            placeholder={`Write back to ${message.name}…`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={sending} className="btn-brand !px-4 !py-2 disabled:opacity-50">
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              {sending ? "Sending" : "Send reply"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] uppercase hover:opacity-70"
              style={{ letterSpacing: "0.14em", color: "var(--brand-muted)" }}
            >
              Cancel
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-[12px]" style={{ color: "#fda4af" }}>
              {error}
            </p>
          ) : null}
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn-ghost-brand !px-4 !py-2">
          <MessageSquare size={13} /> {message.reply_text ? "Reply again" : "Reply"}
        </button>
      )}
    </div>
  );
}