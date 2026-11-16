import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox, Trash2, Mail, Phone, Check } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MessageReply from "@/components/admin/MessageReply";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const { api } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    const res = await api("listMessages");
    setMessages(res?.ok ? res.messages : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleReplied = (updated) => {
    setMessages((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
  };

  const toggleRead = async (message) => {
    const res = await api("markMessage", { id: message.id, is_read: !message.is_read });
    if (res?.ok) {
      setMessages((prev) => prev.map((row) => (row.id === message.id ? { ...row, is_read: !row.is_read } : row)));
    } else {
      toast.error(res?.error || "Could not update that message.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const res = await api("deleteMessage", { id: pendingDelete.id });
    if (res?.ok) {
      setMessages((prev) => prev.filter((row) => row.id !== pendingDelete.id));
      toast.success("Message deleted.");
    } else {
      toast.error(res?.error || "Could not delete that message.");
    }
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Messages</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Questions sent through the contact form. These are inquiries only — no orders can be placed through the site.
        </p>
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: "var(--brand-muted)" }}>
          Loading messages…
        </p>
      ) : messages.length ? (
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className="p-5"
              style={{
                backgroundColor: "var(--brand-surface)",
                border: "1px solid color-mix(in srgb, var(--brand-ink) 10%, transparent)",
                borderLeft: message.is_read ? undefined : "2px solid var(--brand-primary)",
                borderRadius: "var(--brand-radius)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium">
                    {message.name}
                    {!message.is_read ? (
                      <span className="ml-2 font-mono text-[9px] uppercase" style={{ letterSpacing: "0.16em", color: "var(--brand-primary)" }}>
                        New
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px]" style={{ color: "var(--brand-muted)" }}>
                    {message.email ? (
                      <a href={`mailto:${message.email}`} className="flex items-center gap-1.5 hover:opacity-70">
                        <Mail size={11} /> {message.email}
                      </a>
                    ) : null}
                    {message.phone ? (
                      <a href={`tel:${message.phone}`} className="flex items-center gap-1.5 hover:opacity-70">
                        <Phone size={11} /> {message.phone}
                      </a>
                    ) : null}
                    <span className="font-mono">
                      {message.created_date
                        ? new Date(message.created_date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(message)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase hover:opacity-70"
                    style={{ letterSpacing: "0.12em", border: "1px solid color-mix(in srgb, var(--brand-ink) 16%, transparent)", borderRadius: "var(--brand-radius)", color: "var(--brand-muted)" }}
                  >
                    <Check size={11} /> {message.is_read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(message)}
                    aria-label="Delete message"
                    className="p-2 hover:opacity-70"
                    style={{ color: "#fda4af" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                {message.message}
              </p>
              <MessageReply message={message} onReplied={handleReplied} />
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center border py-20 text-center" style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 10%, transparent)" }}>
          <Inbox size={22} style={{ color: "var(--brand-muted)" }} />
          <p className="mt-4 text-[14px]">No messages yet.</p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--brand-muted)" }}>
            Contact form submissions will appear here.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this message?"
        description="This permanently removes the inquiry. It cannot be undone."
        onConfirm={remove}
      />
    </div>
  );
}