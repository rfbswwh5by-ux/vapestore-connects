// Server-only primitives for the administrator access-code system.
// Codes are never stored in plain text: PBKDF2-SHA256 with a per-site salt.

const ITERATIONS = 210000;
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const encoder = new TextEncoder();

// The id of the Base44 app this code is running in. A duplicated app inherits
// the database, so codes and sessions remember which deployment created them
// and are ignored anywhere else. Empty when the id is unavailable.
export function deploymentId() {
  try {
    const runtimeEnv = globalThis.process?.env;
    if (runtimeEnv?.BASE44_APP_ID) return String(runtimeEnv.BASE44_APP_ID);
    if (import.meta?.env?.VITE_BASE44_APP_ID) return String(import.meta.env.VITE_BASE44_APP_ID);
  } catch {
    // fall through
  }
  return "";
}

export function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function randomHex(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return toHex(buffer.buffer);
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
}

export async function hashCode(code, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(code), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromHex(salt), iterations, hash: "SHA-256" },
    key,
    256
  );
  return toHex(bits);
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Codes are typed by hand on phones and tablets, so stray spaces and invisible
// characters are stripped before hashing — a correct code must never be
// rejected because of a trailing space.
export function normalizeCode(code) {
  return String(code ?? "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

export function codeProblem(code) {
  const value = normalizeCode(code);
  if (value.length < 8) return "Use at least 8 characters.";
  if (value.length > 128) return "Use 128 characters or fewer.";
  const weak = ["password", "12345678", "admin123", "vape1234", "letmein1"];
  if (weak.includes(value.toLowerCase())) return "That code is too common. Choose something unique.";
  return null;
}

export async function buildCredential(code) {
  const salt = randomHex(16);
  const hash = await hashCode(normalizeCode(code), salt);
  return { code_hash: hash, salt, iterations: ITERATIONS, rotated_at_ms: Date.now() };
}

export async function verifyCode(code, credential) {
  if (!credential?.code_hash || !credential?.salt) return false;
  const candidate = await hashCode(normalizeCode(code), credential.salt, Number(credential.iterations) || ITERATIONS);
  return timingSafeEqual(candidate, credential.code_hash);
}

// ---- sessions -----------------------------------------------------------

export async function createSession(sr, ipHash, credentialId) {
  const token = randomHex(32);
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await sr.entities.AdminSession.create({
    token_hash: await sha256Hex(token),
    expires_at_ms: expiresAt,
    ip_hash: ipHash || "",
    credential_id: credentialId || "",
    deployment_id: deploymentId(),
  });
  return { token, expiresAt };
}

export async function findSession(sr, token) {
  if (!token || typeof token !== "string" || token.length < 40) return null;
  const hash = await sha256Hex(token);
  const page = await sr.entities.AdminSession.filter({ token_hash: hash }, { limit: 1 });
  const session = page.items?.[0];
  if (!session) return null;
  const currentDeployment = deploymentId();
  if (session.deployment_id && currentDeployment && session.deployment_id !== currentDeployment) {
    await sr.entities.AdminSession.delete(session.id).catch(() => null);
    return null;
  }
  if (Number(session.expires_at_ms) <= Date.now()) {
    await sr.entities.AdminSession.delete(session.id);
    return null;
  }
  return session;
}

// A session remembers which code signed it in. A deleted code resolves to
// nothing — never to the owner's — so a removed person cannot inherit access.
// Sessions created before team access existed have no id and use the first code.
async function credentialFor(sr, session) {
  if (session.credential_id) {
    return sr.entities.AdminCredential.get(session.credential_id).catch(() => null);
  }
  const page = await sr.entities.AdminCredential.list({ limit: 1 });
  return page.items?.[0] || null;
}

export async function requireSession(sr, token) {
  const session = await findSession(sr, token);
  if (!session) {
    const error = new Error("UNAUTHORIZED");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  const credential = await credentialFor(sr, session);
  // A removed person loses dashboard access the moment their code is deleted.
  if (!credential || credential.is_active === false) {
    await sr.entities.AdminSession.delete(session.id).catch(() => null);
    const error = new Error("UNAUTHORIZED");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  return { ...session, credential };
}

export { credentialFor };

export async function revokeSession(sr, token) {
  const session = await findSession(sr, token);
  if (session) await sr.entities.AdminSession.delete(session.id);
}

// Without a credential id, every other session goes; with one, only that
// person's other sessions go, so a code change never signs out a colleague.
export async function revokeOtherSessions(sr, currentSession, credentialId) {
  const page = await sr.entities.AdminSession.list({ limit: 200 });
  const stale = (page.items || []).filter(
    (row) => row.id !== currentSession.id && (!credentialId || !row.credential_id || row.credential_id === credentialId)
  );
  if (stale.length) {
    await sr.entities.AdminSession.deleteMany({ id: { $in: stale.map((row) => row.id) } });
  }
}

export async function revokeCredentialSessions(sr, credentialId) {
  if (!credentialId) return 0;
  const result = await sr.entities.AdminSession.deleteMany({ credential_id: credentialId });
  return result?.deleted || 0;
}

export async function revokeAllSessions(sr) {
  const page = await sr.entities.AdminSession.list({ limit: 200 });
  const ids = (page.items || []).map((row) => row.id);
  if (ids.length) await sr.entities.AdminSession.deleteMany({ id: { $in: ids } });
  return ids.length;
}

export async function clearAllAttempts(sr) {
  const page = await sr.entities.AdminAttempt.list({ limit: 200 });
  const ids = (page.items || []).map((row) => row.id);
  if (ids.length) await sr.entities.AdminAttempt.deleteMany({ id: { $in: ids } });
}

// ---- rate limiting ------------------------------------------------------

export async function assertNotLocked(sr, key) {
  const page = await sr.entities.AdminAttempt.filter({ key }, { limit: 1 });
  const row = page.items?.[0];
  if (!row) return;
  if (Number(row.locked_until_ms) > Date.now()) {
    const minutes = Math.max(1, Math.ceil((Number(row.locked_until_ms) - Date.now()) / 60000));
    const error = new Error("LOCKED");
    error.code = "LOCKED";
    error.minutes = minutes;
    throw error;
  }
}

export async function recordFailure(sr, key) {
  const page = await sr.entities.AdminAttempt.filter({ key }, { limit: 1 });
  const row = page.items?.[0];
  const now = Date.now();
  if (!row || now - Number(row.window_start_ms || 0) > WINDOW_MS) {
    if (row) {
      await sr.entities.AdminAttempt.update(row.id, { fail_count: 1, window_start_ms: now, locked_until_ms: 0 });
    } else {
      await sr.entities.AdminAttempt.create({ key, fail_count: 1, window_start_ms: now, locked_until_ms: 0 });
    }
    return;
  }
  const failCount = Number(row.fail_count || 0) + 1;
  const lockedUntil = failCount >= MAX_FAILURES ? now + LOCK_MS : 0;
  await sr.entities.AdminAttempt.update(row.id, {
    fail_count: failCount,
    window_start_ms: Number(row.window_start_ms) || now,
    locked_until_ms: lockedUntil,
  });
}

export async function clearFailures(sr, key) {
  const page = await sr.entities.AdminAttempt.filter({ key }, { limit: 1 });
  const row = page.items?.[0];
  if (row) await sr.entities.AdminAttempt.delete(row.id);
}

// ---- request identity ---------------------------------------------------

export async function clientKey() {
  try {
    const mod = await import("@tanstack/react-start/server");
    const getRequest = mod.getRequest || mod.getWebRequest;
    const request = getRequest ? getRequest() : null;
    const headers = request?.headers;
    const ip =
      headers?.get?.("cf-connecting-ip") ||
      (headers?.get?.("x-forwarded-for") || "").split(",")[0].trim() ||
      headers?.get?.("x-real-ip") ||
      "";
    return await sha256Hex(ip || "unknown-caller");
  } catch {
    return await sha256Hex("unknown-caller");
  }
}

export const SESSION_TTL = SESSION_TTL_MS;