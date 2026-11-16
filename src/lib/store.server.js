// Server-only store logic. Every administrative mutation runs here, after the
// access-code session has been validated, using the service-role client.
import {
  buildCredential,
  clearAllAttempts,
  clearFailures,
  clientKey,
  codeProblem,
  createSession,
  credentialFor,
  findSession,
  recordFailure,
  requireSession,
  revokeAllSessions,
  revokeCredentialSessions,
  revokeOtherSessions,
  revokeSession,
  assertNotLocked,
  deploymentId,
  verifyCode,
} from "@/lib/admin-security.server";

const TEXT_KEYS = [
  "business_name", "tagline", "logo_url", "favicon_url",
  "color_background", "color_surface", "color_primary", "color_secondary", "color_ink", "color_muted",
  "font_heading", "font_body", "button_style", "logo_size", "header_style", "footer_style", "background_image_url",
  "hero_eyebrow", "hero_headline", "hero_subheadline", "hero_image_url",
  "about_heading", "about_body", "about_image_url",
  "phone", "email", "address_line1", "address_line2", "city", "state", "postal_code", "maps_query",
  "social_instagram", "social_facebook", "social_tiktok", "social_x",
  "store_policies", "meta_title", "meta_description",
  "banner_text", "banner_link_label", "banner_link_url",
  "age_gate_title", "age_gate_message", "age_denied_message", "age_verification_mode", "age_provider_name", "age_provider_url",
  "privacy_policy", "terms_conditions", "compliance_notice", "footer_note",
];
const BOOL_KEYS = ["show_categories", "show_featured", "show_about", "show_location", "show_hours", "banner_visible"];
const LONG_KEYS = ["about_body", "privacy_policy", "terms_conditions", "store_policies", "compliance_notice"];

const AVAILABILITY = ["in_stock", "low_stock", "out_of_stock", "special_order"];

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const str = (value, max = 400) => String(value ?? "").slice(0, max);

// An access code created before team access existed belongs to the owner.
const roleOf = (credential) => (credential?.role === "staff" ? "staff" : "owner");
const credentialName = (credential) =>
  str(credential?.display_name, 60) || (roleOf(credential) === "owner" ? "Owner" : "Team member");

// Only codes created by this deployment count. A duplicated app inherits the
// database, so a copied shop sees no administrator code and asks for a fresh one.
async function listCredentials(sr) {
  const all = items(await sr.entities.AdminCredential.list({ limit: 50, sort: "created_date" }));
  const id = deploymentId();
  return id ? all.filter((row) => !row.deployment_id || row.deployment_id === id) : all;
}

async function dropInheritedCredentials(sr) {
  const id = deploymentId();
  if (!id) return;
  const all = items(await sr.entities.AdminCredential.list({ limit: 50 }));
  const stale = all.filter((row) => row.deployment_id && row.deployment_id !== id).map((row) => row.id);
  if (stale.length) await sr.entities.AdminCredential.deleteMany({ id: { $in: stale } });
}

function ownerGate(session) {
  if (roleOf(session?.credential) === "owner") return null;
  return { ok: false, code: "FORBIDDEN", error: "Only the owner can change who has access to this dashboard." };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function replyHtml(settings, message, body) {
  const business = settings?.business_name || "us";
  const paragraph = escapeHtml(body).replace(/\n/g, "<br />");
  const contact = [settings?.phone, settings?.email].filter(Boolean).join(" · ");
  return `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.65;color:#111111;max-width:560px">
  <p>Hi ${escapeHtml(message.name)},</p>
  <p>${paragraph}</p>
  <p style="margin-top:28px">— ${escapeHtml(business)}</p>
  ${contact ? `<p style="color:#666666;font-size:13px">${escapeHtml(contact)}</p>` : ""}
</div>`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------- settings

export async function getPublicSettings(base44) {
  const result = await base44.entities.SiteSettings.list({ limit: 1 });
  return items(result)[0] || null;
}

async function loadSettingsRecord(sr) {
  const result = await sr.entities.SiteSettings.list({ limit: 1 });
  return items(result)[0] || null;
}

function sanitizeSettings(values) {
  const patch = {};
  TEXT_KEYS.forEach((key) => {
    if (values[key] !== undefined) patch[key] = str(values[key], LONG_KEYS.includes(key) ? 40000 : 2000);
  });
  BOOL_KEYS.forEach((key) => {
    if (values[key] !== undefined) patch[key] = Boolean(values[key]);
  });
  if (values.age_minimum !== undefined) {
    const age = Number(values.age_minimum);
    patch.age_minimum = Number.isFinite(age) ? Math.min(21, Math.max(18, Math.round(age))) : 21;
  }
  if (Array.isArray(values.hours)) {
    patch.hours = values.hours.slice(0, 14).map((row) => ({ day: str(row?.day, 40), hours: str(row?.hours, 80) }));
  }
  if (Array.isArray(values.about_sections)) {
    patch.about_sections = values.about_sections
      .slice(0, 8)
      .map((row) => ({ title: str(row?.title, 120), body: str(row?.body, 2000) }))
      .filter((row) => row.title || row.body);
  }
  if (Array.isArray(values.holiday_hours)) {
    patch.holiday_hours = values.holiday_hours
      .slice(0, 30)
      .map((row) => ({ label: str(row?.label, 80), hours: str(row?.hours, 80) }));
  }
  return patch;
}

async function saveSettings(sr, values) {
  const patch = sanitizeSettings(values || {});
  const existing = await loadSettingsRecord(sr);
  if (existing) {
    return sr.entities.SiteSettings.update(existing.id, patch);
  }
  return sr.entities.SiteSettings.create({ ...patch, singleton: true, business_name: patch.business_name || "Your Shop" });
}

// ---------------------------------------------------------------- catalog

function sanitizeProduct(values) {
  const availability = AVAILABILITY.includes(values?.availability) ? values.availability : "in_stock";
  return {
    name: str(values?.name, 160),
    brand: str(values?.brand, 120),
    category: str(values?.category, 120),
    description: str(values?.description, 4000),
    image_url: str(values?.image_url, 1000),
    price_display: str(values?.price_display, 40),
    availability,
    specs: Array.isArray(values?.specs)
      ? values.specs
          .slice(0, 24)
          .map((row) => ({ label: str(row?.label, 60), value: str(row?.value, 120) }))
          .filter((row) => row.label || row.value)
      : [],
    is_visible: values?.is_visible !== false,
    is_featured: Boolean(values?.is_featured),
    sort_order: Number.isFinite(Number(values?.sort_order)) ? Number(values.sort_order) : 0,
  };
}

function sanitizeCategory(values) {
  const name = str(values?.name, 120);
  return {
    name,
    slug: slugify(values?.slug || name),
    description: str(values?.description, 600),
    image_url: str(values?.image_url, 1000),
    sort_order: Number.isFinite(Number(values?.sort_order)) ? Number(values.sort_order) : 0,
    is_visible: values?.is_visible !== false,
  };
}

function sanitizeFaq(values) {
  return {
    question: str(values?.question, 300),
    answer: str(values?.answer, 4000),
    sort_order: Number.isFinite(Number(values?.sort_order)) ? Number(values.sort_order) : 0,
    is_visible: values?.is_visible !== false,
  };
}

// ---------------------------------------------------------------- admin api

async function statusAction(sr) {
  const credentials = await listCredentials(sr);
  const settings = await loadSettingsRecord(sr);
  return {
    ok: true,
    claimed: credentials.length > 0,
    businessName: settings?.business_name || "",
    logoUrl: settings?.logo_url || "",
  };
}

async function claimAction(sr, payload) {
  const existing = (await listCredentials(sr))[0];
  if (existing) return { ok: false, code: "ALREADY_CLAIMED", error: "This site already has an administrator code." };
  const code = str(payload?.code, 200);
  const problem = codeProblem(code);
  if (problem) return { ok: false, code: "WEAK", error: problem };
  await dropInheritedCredentials(sr);
  const created = await sr.entities.AdminCredential.create({
    ...(await buildCredential(code)),
    display_name: "Owner",
    role: "owner",
    is_active: true,
    deployment_id: deploymentId(),
  });
  const session = await createSession(sr, await clientKey(), created.id);
  return { ok: true, token: session.token, expiresAt: session.expiresAt, role: "owner", name: "Owner" };
}

async function loginAction(sr, payload) {
  const credentials = (await listCredentials(sr)).filter((row) => row.is_active !== false);
  if (!credentials.length) return { ok: false, code: "NEEDS_SETUP", error: "No administrator code has been set for this site yet." };
  const key = await clientKey();
  await assertNotLocked(sr, key);
  const code = str(payload?.code, 200);
  let matched = null;
  if (code) {
    for (const credential of credentials) {
      if (await verifyCode(code, credential)) {
        matched = credential;
        break;
      }
    }
  }
  if (!matched) {
    await recordFailure(sr, key);
    return { ok: false, code: "INVALID", error: "That access code is not correct." };
  }
  await clearFailures(sr, key);
  await sr.entities.AdminCredential.update(matched.id, { last_used_ms: Date.now() });
  const session = await createSession(sr, key, matched.id);
  return {
    ok: true,
    token: session.token,
    expiresAt: session.expiresAt,
    role: roleOf(matched),
    name: credentialName(matched),
  };
}

async function changeCodeAction(sr, session, payload) {
  const cred = session.credential;
  if (!cred) return { ok: false, code: "NEEDS_SETUP", error: "No access code is set for this site." };
  const key = await clientKey();
  await assertNotLocked(sr, key);
  const current = str(payload?.currentCode, 200);
  if (!(await verifyCode(current, cred))) {
    await recordFailure(sr, key);
    return { ok: false, code: "INVALID", error: "Your current access code is not correct." };
  }
  const next = str(payload?.newCode, 200);
  const problem = codeProblem(next);
  if (problem) return { ok: false, code: "WEAK", error: problem };
  if (next === current) return { ok: false, code: "WEAK", error: "Choose a code different from your current one." };
  await sr.entities.AdminCredential.update(cred.id, await buildCredential(next));
  await revokeOtherSessions(sr, session, cred.id);
  await clearFailures(sr, key);
  return { ok: true };
}

async function statsAction(sr) {
  const [total, published, hidden, categories, faqs, messages] = await Promise.all([
    sr.entities.Product.count({}),
    sr.entities.Product.count({ is_visible: true }),
    sr.entities.Product.count({ is_visible: false }),
    sr.entities.ProductCategory.count({}),
    sr.entities.FaqItem.count({}),
    sr.entities.ContactMessage.count({ is_read: false }),
  ]);
  return { ok: true, stats: { total, published, hidden, categories, faqs, unreadMessages: messages } };
}

async function authedAction(sr, session, action, payload) {
  switch (action) {
    case "getSettings": {
      const settings = await loadSettingsRecord(sr);
      return { ok: true, settings: settings || null };
    }
    case "saveSettings": {
      const saved = await saveSettings(sr, payload);
      return { ok: true, settings: saved };
    }
    case "stats":
      return statsAction(sr);
    case "changeCode":
      return changeCodeAction(sr, session, payload);

    case "listTeam": {
      const credentials = await listCredentials(sr);
      return {
        ok: true,
        role: roleOf(session.credential),
        meId: session.credential?.id || null,
        team: credentials
          .filter((row) => row.is_active !== false)
          .map((row) => ({
            id: row.id,
            name: credentialName(row),
            role: roleOf(row),
            created_date: row.created_date || null,
            last_used_ms: Number(row.last_used_ms) || null,
          })),
      };
    }
    case "addTeamMember": {
      const denied = ownerGate(session);
      if (denied) return denied;
      const name = str(payload?.name, 60).trim();
      if (name.length < 2) return { ok: false, error: "Add a name so you know whose code it is." };
      const code = str(payload?.code, 200);
      const problem = codeProblem(code);
      if (problem) return { ok: false, code: "WEAK", error: problem };
      const credentials = await listCredentials(sr);
      if (credentials.length >= 6) return { ok: false, error: "You can have up to 6 access codes. Remove one first." };
      const clash = await Promise.all(credentials.map((row) => verifyCode(code, row)));
      if (clash.some(Boolean)) return { ok: false, code: "WEAK", error: "That code is already used. Choose a different one." };
      const created = await sr.entities.AdminCredential.create({
        ...(await buildCredential(code)),
        display_name: name,
        role: "staff",
        is_active: true,
        deployment_id: deploymentId(),
      });
      return { ok: true, member: { id: created.id, name, role: "staff" } };
    }
    case "removeTeamMember": {
      const denied = ownerGate(session);
      if (denied) return denied;
      const id = str(payload?.id, 60);
      const credential = id ? await sr.entities.AdminCredential.get(id).catch(() => null) : null;
      if (!credential) return { ok: false, error: "That person is no longer on the list." };
      if (roleOf(credential) === "owner") {
        return { ok: false, code: "FORBIDDEN", error: "The owner's access cannot be removed. Change your own code instead." };
      }
      await revokeCredentialSessions(sr, credential.id);
      await sr.entities.AdminCredential.delete(credential.id);
      return { ok: true };
    }
    case "resetTeamCode": {
      const denied = ownerGate(session);
      if (denied) return denied;
      const id = str(payload?.id, 60);
      const code = str(payload?.code, 200);
      const problem = codeProblem(code);
      if (problem) return { ok: false, code: "WEAK", error: problem };
      const credential = id ? await sr.entities.AdminCredential.get(id).catch(() => null) : null;
      if (!credential) return { ok: false, error: "That person is no longer on the list." };
      if (roleOf(credential) === "owner" && credential.id !== session.credential?.id) {
        return { ok: false, code: "FORBIDDEN", error: "Only the owner can change the owner's code." };
      }
      await sr.entities.AdminCredential.update(credential.id, await buildCredential(code));
      await revokeCredentialSessions(sr, credential.id);
      return { ok: true };
    }

    case "listProducts":
      return { ok: true, products: items(await sr.entities.Product.list({ limit: 500, sort: "sort_order" })) };
    case "saveProduct": {
      const values = sanitizeProduct(payload);
      if (!values.name) return { ok: false, error: "A product name is required." };
      if (payload?.id) {
        const saved = await sr.entities.Product.update(payload.id, values);
        return { ok: true, product: saved };
      }
      const saved = await sr.entities.Product.create(values);
      return { ok: true, product: saved };
    }
    case "deleteProduct": {
      if (!payload?.id) return { ok: false, error: "Missing product." };
      await sr.entities.Product.delete(payload.id);
      return { ok: true };
    }

    case "listCategories":
      return { ok: true, categories: items(await sr.entities.ProductCategory.list({ limit: 200, sort: "sort_order" })) };
    case "saveCategory": {
      const values = sanitizeCategory(payload);
      if (!values.name) return { ok: false, error: "A category name is required." };
      if (payload?.id) {
        const before = await sr.entities.ProductCategory.get(payload.id);
        const saved = await sr.entities.ProductCategory.update(payload.id, values);
        if (before?.name && before.name !== values.name) {
          await sr.entities.Product.updateMany({ category: before.name }, { $set: { category: values.name } });
        }
        return { ok: true, category: saved };
      }
      const saved = await sr.entities.ProductCategory.create(values);
      return { ok: true, category: saved };
    }
    case "deleteCategory": {
      if (!payload?.id) return { ok: false, error: "Missing category." };
      const category = await sr.entities.ProductCategory.get(payload.id);
      if (category?.name) {
        if (payload.mode === "delete") {
          await sr.entities.Product.deleteMany({ category: category.name });
        } else {
          await sr.entities.Product.updateMany({ category: category.name }, { $set: { category: "" } });
        }
      }
      await sr.entities.ProductCategory.delete(payload.id);
      return { ok: true };
    }
    case "reorderCategories": {
      const ids = Array.isArray(payload?.ids) ? payload.ids.filter((id) => typeof id === "string") : [];
      if (ids.length) {
        await sr.entities.ProductCategory.bulkUpdate(ids.map((id, index) => ({ id, sort_order: index })));
      }
      return { ok: true };
    }

    case "listFaqs":
      return { ok: true, faqs: items(await sr.entities.FaqItem.list({ limit: 300, sort: "sort_order" })) };
    case "saveFaq": {
      const values = sanitizeFaq(payload);
      if (!values.question) return { ok: false, error: "A question is required." };
      if (payload?.id) {
        return { ok: true, faq: await sr.entities.FaqItem.update(payload.id, values) };
      }
      return { ok: true, faq: await sr.entities.FaqItem.create(values) };
    }
    case "deleteFaq": {
      if (!payload?.id) return { ok: false, error: "Missing question." };
      await sr.entities.FaqItem.delete(payload.id);
      return { ok: true };
    }
    case "reorderFaqs": {
      const ids = Array.isArray(payload?.ids) ? payload.ids.filter((id) => typeof id === "string") : [];
      if (ids.length) await sr.entities.FaqItem.bulkUpdate(ids.map((id, index) => ({ id, sort_order: index })));
      return { ok: true };
    }

    case "listMessages":
      return { ok: true, messages: items(await sr.entities.ContactMessage.list({ limit: 300, sort: "-created_date" })) };
    case "markMessage": {
      if (!payload?.id) return { ok: false, error: "Missing message." };
      await sr.entities.ContactMessage.update(payload.id, { is_read: Boolean(payload.is_read) });
      return { ok: true };
    }
    case "deleteMessage": {
      if (!payload?.id) return { ok: false, error: "Missing message." };
      await sr.entities.ContactMessage.delete(payload.id);
      return { ok: true };
    }
    case "replyMessage": {
      const id = str(payload?.id, 60);
      const body = str(payload?.replyBody, 4000).trim();
      if (!id) return { ok: false, error: "Missing message." };
      if (!body) return { ok: false, error: "Write a reply before sending." };
      const message = await sr.entities.ContactMessage.get(id).catch(() => null);
      if (!message) return { ok: false, error: "That message no longer exists." };
      const settings = await loadSettingsRecord(sr);
      const saved = await sr.entities.ContactMessage.update(id, {
        reply_text: body,
        reply_by: credentialName(session.credential),
        replied_at_ms: Date.now(),
        is_read: true,
      });
      if (!message.email) return { ok: true, emailed: false, reason: "no-email", message: saved };
      try {
        await sr.integrations.Core.SendEmail({
          to: message.email,
          from_name: settings?.business_name || undefined,
          subject: `Re: your message to ${settings?.business_name || "us"}`,
          html: replyHtml(settings, message, body),
        });
        return { ok: true, emailed: true, message: saved };
      } catch {
        return { ok: true, emailed: false, reason: "send-failed", message: saved };
      }
    }

    default:
      return { ok: false, code: "UNKNOWN_ACTION", error: "Unknown action." };
  }
}

export async function adminAction(base44, { action, token, payload }) {
  const sr = base44.asServiceRole;
  try {
    switch (action) {
      case "status":
        return await statusAction(sr);
      case "claim":
        return await claimAction(sr, payload);
      case "login":
        return await loginAction(sr, payload);
      case "logout":
        await revokeSession(sr, token);
        return { ok: true };
      case "session": {
        const session = await findSession(sr, token);
        if (!session) return { ok: false, code: "UNAUTHORIZED" };
        const credential = await credentialFor(sr, session);
        if (!credential || credential.is_active === false) {
          await revokeSession(sr, token);
          return { ok: false, code: "UNAUTHORIZED" };
        }
        return {
          ok: true,
          expiresAt: session.expires_at_ms,
          role: roleOf(credential),
          name: credentialName(credential),
        };
      }
      default: {
        const session = await requireSession(sr, token);
        return await authedAction(sr, session, action, payload);
      }
    }
  } catch (error) {
    if (error?.code === "LOCKED") {
      return { ok: false, code: "LOCKED", error: `Too many incorrect attempts. Try again in ${error.minutes} minute(s).` };
    }
    if (error?.code === "UNAUTHORIZED") {
      return { ok: false, code: "UNAUTHORIZED", error: "Your session has expired. Enter your access code again." };
    }
    return { ok: false, code: "ERROR", error: error?.message || "Something went wrong." };
  }
}

// ---------------------------------------------------------------- recovery

// Only reachable by a signed-in administrator of this Base44 app (the site
// owner), as enforced in the server function's middleware. Each duplicated
// deployment has its own owner account, so this never crosses businesses.
export async function recoverCredential(base44, code) {
  const sr = base44.asServiceRole;
  const problem = codeProblem(str(code, 200));
  if (problem) return { ok: false, code: "WEAK", error: problem };
  const credentials = await listCredentials(sr);
  const existing = credentials.find((row) => roleOf(row) === "owner") || credentials[0] || null;
  const credential = await buildCredential(str(code, 200));
  const ownerFields = { ...credential, role: "owner", is_active: true, deployment_id: deploymentId() };
  if (existing) {
    await sr.entities.AdminCredential.update(existing.id, ownerFields);
  } else {
    await sr.entities.AdminCredential.create({ ...ownerFields, display_name: "Owner" });
  }
  await revokeAllSessions(sr);
  await clearAllAttempts(sr);
  return { ok: true };
}

// ---------------------------------------------------------------- contact

const CONTACT_LIMIT = 4;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

// The contact form is open to anyone, so a single caller gets a handful of
// messages an hour. Past that the shop's inbox is protected instead of filled.
async function contactAllowed(sr) {
  const key = `contact:${await clientKey()}`;
  const page = await sr.entities.AdminAttempt.filter({ key }, { limit: 1 });
  const row = page.items?.[0];
  const now = Date.now();
  if (!row || now - Number(row.window_start_ms || 0) > CONTACT_WINDOW_MS) {
    if (row) await sr.entities.AdminAttempt.update(row.id, { fail_count: 1, window_start_ms: now });
    else await sr.entities.AdminAttempt.create({ key, fail_count: 1, window_start_ms: now });
    return true;
  }
  if (Number(row.fail_count || 0) >= CONTACT_LIMIT) return false;
  await sr.entities.AdminAttempt.update(row.id, { fail_count: Number(row.fail_count || 0) + 1 });
  return true;
}

export async function submitContact(base44, payload) {
  const sr = base44.asServiceRole;
  if (!(await contactAllowed(sr))) {
    return {
      ok: false,
      error: "We've already had a few messages from this device. Please call the shop, or try again a little later.",
    };
  }
  const record = {
    name: str(payload?.name, 120),
    email: str(payload?.email, 160),
    phone: str(payload?.phone, 60),
    message: str(payload?.message, 4000),
    is_read: false,
  };
  await sr.entities.ContactMessage.create(record);
  return { ok: true };
}