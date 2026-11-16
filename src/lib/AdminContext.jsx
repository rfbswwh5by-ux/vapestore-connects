import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminApi, getSiteSettings } from "@/lib/server-fns";

const TOKEN_KEY = "cn_admin_token";

const AdminContext = createContext(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside AdminProvider");
  return context;
}

function readToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function AdminProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [settings, setSettings] = useState(null);
  const [branding, setBranding] = useState({ business_name: "", logo_url: "" });
  const [expiresAt, setExpiresAt] = useState(null);
  const [role, setRole] = useState("owner");
  const [meName, setMeName] = useState("");

  const loadSettings = useCallback(async (token) => {
    const res = await adminApi({ data: { action: "getSettings", token, payload: {} } });
    if (res?.ok) {
      setSettings(res.settings || null);
      setBranding({
        business_name: res.settings?.business_name || "",
        logo_url: res.settings?.logo_url || "",
      });
    }
    return res;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      const publicSettings = await getSiteSettings().catch(() => null);
      if (publicSettings) {
        setBranding({
          business_name: publicSettings.business_name || "",
          logo_url: publicSettings.logo_url || "",
        });
      }

      const stored = readToken();
      if (stored) {
        const check = await adminApi({ data: { action: "session", token: stored, payload: {} } }).catch(() => null);
        if (check?.ok) {
          setExpiresAt(check.expiresAt || null);
          setRole(check.role === "staff" ? "staff" : "owner");
          setMeName(check.name || "");
          await loadSettings(stored);
          setStatus("unlocked");
          return;
        }
        window.sessionStorage.removeItem(TOKEN_KEY);
      }

      const state = await adminApi({ data: { action: "status", payload: {} } }).catch(() => null);
      setStatus(state?.claimed ? "locked" : "setup");
    })();
  }, [loadSettings]);

  const api = useCallback(
    async (action, payload = {}) => {
      const token = readToken();
      const res = await adminApi({ data: { action, token, payload } });
      if (res?.code === "UNAUTHORIZED") {
        window.sessionStorage.removeItem(TOKEN_KEY);
        setStatus("locked");
      }
      return res;
    },
    []
  );

  const startSession = useCallback(
    async (res) => {
      window.sessionStorage.setItem(TOKEN_KEY, res.token);
      setExpiresAt(res.expiresAt || null);
      setRole(res.role === "staff" ? "staff" : "owner");
      setMeName(res.name || "");
      await loadSettings(res.token);
      setStatus("unlocked");
    },
    [loadSettings]
  );

  const login = useCallback(
    async (code) => {
      const res = await adminApi({ data: { action: "login", payload: { code } } });
      if (res?.ok) {
        await startSession(res);
      } else if (res?.code === "NEEDS_SETUP") {
        setStatus("setup");
      }
      return res;
    },
    [startSession]
  );

  const claim = useCallback(
    async (code) => {
      const res = await adminApi({ data: { action: "claim", payload: { code } } });
      if (res?.ok) await startSession(res);
      return res;
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    const token = readToken();
    window.sessionStorage.removeItem(TOKEN_KEY);
    setStatus("locked");
    setSettings(null);
    if (token) await adminApi({ data: { action: "logout", token, payload: {} } }).catch(() => null);
  }, []);

  const saveSettings = useCallback(
    async (values) => {
      const res = await api("saveSettings", values);
      if (res?.ok) {
        setSettings(res.settings || null);
        setBranding({
          business_name: res.settings?.business_name || "",
          logo_url: res.settings?.logo_url || "",
        });
      }
      return res;
    },
    [api]
  );

  const refresh = useCallback(async () => {
    const token = readToken();
    if (token) await loadSettings(token);
  }, [loadSettings]);

  const value = useMemo(
    () => ({
      status,
      settings,
      branding,
      expiresAt,
      role,
      meName,
      isOwner: role === "owner",
      api,
      login,
      claim,
      logout,
      saveSettings,
      refresh,
      setStatus,
    }),
    [status, settings, branding, expiresAt, role, meName, api, login, claim, logout, saveSettings, refresh]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}