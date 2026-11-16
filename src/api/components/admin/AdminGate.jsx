import { useState } from "react";
import { Loader2, LockKeyhole, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";
import { recoverAdminCode } from "@/lib/server-fns";

function Frame({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12" style={{ backgroundColor: "var(--brand-bg)" }}>
      <div
        className="w-full max-w-md px-7 py-10 sm:px-10 sm:py-12"
        style={{
          backgroundColor: "var(--brand-surface)",
          border: "1px solid color-mix(in srgb, var(--brand-ink) 12%, transparent)",
          borderRadius: "var(--brand-radius)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminGate() {
  const { status, branding, login, claim } = useAdmin();
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const isSetup = status === "setup";

  const resetAccess = async () => {
    setNotice("");
    setResetBusy(true);
    try {
      const res = await recoverAdminCode({ data: { code: resetCode } });
      if (res?.ok) {
        setNotice("Code reset. Enter your new code above to sign in.");
        setCode(resetCode);
        setResetCode("");
        setRecovery(false);
      } else {
        setNotice(res?.error || "Could not reset the access code.");
      }
    } catch {
      setNotice("Only the account that owns this website can reset the code. Sign in to that account first.");
    } finally {
      setResetBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (isSetup && code !== confirm) {
      setError("The two codes do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = isSetup ? await claim(code) : await login(code);
      if (!res?.ok) setError(res?.error || "That code is not correct.");
      else setCode("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--brand-bg)" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
      </div>
    );
  }

  return (
    <Frame>
      <div className="flex flex-col items-center text-center">
        {branding.logo_url ? (
          <img src={branding.logo_url} alt="" className="h-10 w-auto object-contain" />
        ) : (
          <span className="flex items-center gap-2">
            <span className="block h-2.5 w-2.5 rotate-45" style={{ backgroundColor: "var(--brand-primary)" }} />
            <span className="font-heading text-[13px] font-semibold uppercase" style={{ letterSpacing: "0.16em" }}>
              {branding.business_name || "Administrator"}
            </span>
          </span>
        )}
        <p className="mt-8 font-mono text-[10px] uppercase" style={{ letterSpacing: "0.22em", color: "var(--brand-primary)" }}>
          {isSetup ? "First-time setup" : "Dashboard access"}
        </p>
        <h1 className="mt-3 text-2xl font-medium">{isSetup ? "Claim this website" : "Enter your access code"}</h1>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
          {isSetup
            ? "This site has no administrator code yet. Set one now to become the owner. Choose something long and unique, and keep it safe."
            : branding.business_name
              ? `Dashboard for ${branding.business_name}. Use your own access code.`
              : "Enter your access code for this website."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={isSetup ? "Choose an access code" : "Access code"}
            autoComplete="current-password"
            autoFocus
            className="field !py-3 pr-11 font-mono tracking-[0.18em]"
            style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 16%, transparent)" }}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide code" : "Show code"}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {isSetup ? (
          <input
            type={visible ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Confirm access code"
            autoComplete="new-password"
            className="field !py-3 font-mono tracking-[0.18em]"
            style={{ borderColor: "color-mix(in srgb, var(--brand-ink) 16%, transparent)" }}
          />
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 pt-1">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" style={{ color: "#fda4af" }} />
            <p className="text-[12px] leading-relaxed" style={{ color: "#fda4af" }}>
              {error}
            </p>
          </div>
        ) : null}

        <button type="submit" disabled={busy || !code} className="btn-brand w-full !py-3.5 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <LockKeyhole size={14} />}
          {busy ? "Checking" : isSetup ? "Set code & enter" : "Enter dashboard"}
        </button>
      </form>

      {notice ? (
        <p className="mt-4 text-center text-[11px] leading-relaxed" style={{ color: "var(--brand-primary)" }}>
          {notice}
        </p>
      ) : null}

      {!isSetup ? (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setRecovery((prev) => !prev)}
            className="text-[11px] underline underline-offset-2 hover:opacity-70"
            style={{ color: "var(--brand-muted)" }}
          >
            Lost your access code?
          </button>
        </div>
      ) : null}

      {recovery ? (
        <div
          className="mt-4 p-4"
          style={{ border: "1px solid color-mix(in srgb, var(--brand-ink) 14%, transparent)", borderRadius: "var(--brand-radius)" }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
            A lost owner code can only be reset from the owner's own account for this website. If you are signed in as
            that owner, choose a new code below. Team members should ask the owner for a new code instead.
          </p>
          <input
            type="password"
            value={resetCode}
            onChange={(event) => setResetCode(event.target.value)}
            placeholder="New access code"
            autoComplete="new-password"
            className="field mt-3 font-mono tracking-[0.18em]"
          />
          <button
            type="button"
            onClick={resetAccess}
            disabled={resetBusy || resetCode.length < 8}
            className="btn-ghost-brand mt-2 w-full !py-2.5 disabled:opacity-50"
          >
            {resetBusy ? <Loader2 size={13} className="animate-spin" /> : null}
            {resetBusy ? "Resetting" : "Reset access code"}
          </button>
        </div>
      ) : null}

      <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
        {isSetup
          ? "Whoever sets this code first becomes the administrator. Do this immediately after deploying a new site."
          : "Codes are stored as salted hashes. Sessions expire after 8 hours, and repeated failed attempts are locked out."}
      </p>
    </Frame>
  );
}