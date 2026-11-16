import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useSite } from "@/lib/SiteContext";

const KEY = "age_verified_v1";

export default function AgeGate({ children }) {
  const site = useSite();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("age_verified");
    if (flag === "1") {
      window.sessionStorage.setItem(KEY, "1");
      params.delete("age_verified");
    }
    if (flag === "0") {
      window.sessionStorage.removeItem(KEY);
      params.delete("age_verified");
    }
    if (flag) {
      const next = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", next);
    }
    setStatus(window.sessionStorage.getItem(KEY) === "1" ? "verified" : "locked");
  }, []);

  const confirm = () => {
    window.sessionStorage.setItem(KEY, "1");
    setStatus("verified");
  };

  if (status === "verified") {
    return <div className="animate-[fadeUp_0.6s_ease-out_both]">{children}</div>;
  }

  const denied = status === "denied";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-5 py-10" style={{ backgroundColor: "var(--brand-bg)" }}>
      <img
        src={site.hero_image_url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.16] blur-[3px]"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, transparent, var(--brand-bg) 72%)" }}
      />

      <div
        className="relative w-full max-w-lg px-7 py-10 sm:px-11 sm:py-12"
        style={{
          backgroundColor: "color-mix(in srgb, var(--brand-surface) 82%, transparent)",
          border: "1px solid color-mix(in srgb, var(--brand-ink) 12%, transparent)",
          backdropFilter: "blur(26px) saturate(130%)",
          boxShadow: "0 40px 120px -40px rgba(0,0,0,0.9)",
        }}
      >
        <div className="flex justify-center">
          <Logo />
        </div>

        {denied ? (
          <div className="mt-9 text-center">
            <p className="eyebrow">Access restricted</p>
            <h1 className="mt-4 text-[26px] font-medium leading-tight">We can't let you in</h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              {site.age_denied_message}
            </p>
            <button
              type="button"
              onClick={() => setStatus("locked")}
              className="btn-ghost-brand mt-8 w-full"
            >
              I entered my age by mistake
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow mt-9 text-center">Age verification</p>
            <h1 className="mt-4 text-center text-[clamp(1.6rem,4vw,2rem)] font-medium leading-tight">
              {site.age_gate_title}
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed" style={{ color: "var(--brand-muted)" }}>
              {site.age_gate_message}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {site.age_verification_mode === "third_party" && site.age_provider_url ? (
                <a
                  href={site.age_provider_url}
                  className="btn-brand col-span-2"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Verify with {site.age_provider_name || "our partner"}
                </a>
              ) : (
                <>
                  <button type="button" onClick={confirm} className="btn-brand">
                    Yes, I'm {site.age_minimum || 21}+
                  </button>
                  <button type="button" onClick={() => setStatus("denied")} className="btn-ghost-brand">
                    No
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 flex items-start gap-2.5">
              <ShieldCheck size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: "var(--brand-primary)" }} />
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--brand-muted)" }}>
                By entering you confirm you are of legal age to purchase tobacco and vapor products in your
                jurisdiction, and you agree to our{" "}
                <Link to="/terms" className="underline underline-offset-2 hover:opacity-70">
                  terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline underline-offset-2 hover:opacity-70">
                  privacy policy
                </Link>
                . This is a self-attestation. Photo ID is required in store for every purchase.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}