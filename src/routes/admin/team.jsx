import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, Loader2, ShieldCheck, Users } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import { SectionCard } from "@/components/admin/Field";
import AddTeamMemberForm from "@/components/admin/AddTeamMemberForm";
import TeamMemberCard from "@/components/admin/TeamMemberCard";

export const Route = createFileRoute("/admin/team")({
  component: TeamPage,
});

function TeamPage() {
  const { api, role, meName } = useAdmin();
  const [team, setTeam] = useState([]);
  const [myRole, setMyRole] = useState(role || "owner");
  const [meId, setMeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const res = await api("listTeam");
    if (res?.ok) {
      setTeam(res.team || []);
      setMyRole(res.role || "owner");
      setMeId(res.meId || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isOwner = myRole === "owner";

  const copyCode = async () => {
    if (!shared) return;
    try {
      await navigator.clipboard.writeText(shared.code);
      setCopied(true);
      toast.success("Code copied.");
    } catch {
      toast.error("Could not copy. Read it off the screen instead.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.6vw,2rem)] font-medium">Team access</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          Give someone at the shop their own access code. They can update the website, but they cannot remove you or add
          anyone else — only you can do that.
        </p>
      </div>

      {shared ? (
        <section
          className="p-5 sm:p-6"
          style={{
            backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, var(--brand-surface))",
            border: "1px solid var(--brand-primary)",
            borderRadius: "var(--brand-radius)",
          }}
        >
          <p className="font-heading text-[15px] font-medium">Code for {shared.name}</p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--brand-muted)" }}>
            Write it down or send it to them now. For their safety it is not shown again here, but you can set a new one
            at any time.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code
              className="px-4 py-2.5 font-mono text-[15px]"
              style={{
                backgroundColor: "var(--brand-bg)",
                border: "1px solid color-mix(in srgb, var(--brand-ink) 16%, transparent)",
                borderRadius: "var(--brand-radius)",
                color: "var(--brand-ink)",
              }}
            >
              {shared.code}
            </code>
            <button type="button" onClick={copyCode} className="btn-ghost-brand !px-4 !py-2">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy code"}
            </button>
            <button type="button" onClick={() => setShared(null)} className="font-mono text-[10px] uppercase hover:opacity-70" style={{ letterSpacing: "0.14em", color: "var(--brand-muted)" }}>
              Done
            </button>
          </div>
        </section>
      ) : null}

      {isOwner ? (
        <SectionCard
          title="Add someone to your team"
          description="They sign in at the same dashboard address with the code you set here."
        >
          <AddTeamMemberForm
            onAdded={(member) => {
              setShared(member);
              setCopied(false);
              toast.success(`${member.name} can now open the dashboard.`);
              load();
            }}
          />
        </SectionCard>
      ) : (
        <SectionCard title="Only the owner can add or remove people" description="Your own code can be changed under Security.">
          <p className="text-[13px]" style={{ color: "var(--brand-muted)" }}>
            You are signed in as a team member{meName ? ` (${meName})` : ""}. Ask the owner if someone else needs access.
          </p>
        </SectionCard>
      )}

      <SectionCard
        title="Who can open this dashboard"
        description={
          loading ? "Loading…" : `${team.length} access code${team.length === 1 ? "" : "s"} for this website.`
        }
      >
        {loading ? (
          <p className="flex items-center gap-2 text-[13px]" style={{ color: "var(--brand-muted)" }}>
            <Loader2 size={14} className="animate-spin" /> Loading your team…
          </p>
        ) : team.length ? (
          <div className="space-y-2.5">
            {team.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                canManage={isOwner}
                isSelf={member.id === meId}
                onChanged={load}
              />
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-[13px]" style={{ color: "var(--brand-muted)" }}>
            <Users size={14} /> No access codes found yet.
          </p>
        )}
      </SectionCard>

      <SectionCard title="What each person can do" description="This is enforced on the server, so nobody can get around it.">
        <ul className="space-y-3 text-[12px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          {[
            "The owner can do everything: content, messages, and who has access.",
            "A team member can update products, categories, homepage, branding, store info, FAQ, messages, SEO and their own code.",
            "A team member cannot remove the owner, add anyone else, or change someone else's code.",
            "Removing a person deletes their code and signs them out immediately.",
            "Every code is stored only as a salted hash and is checked on the server for every change.",
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