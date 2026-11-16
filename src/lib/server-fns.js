import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { adminAction, getPublicSettings, recoverCredential, submitContact } from "@/lib/store.server";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  return getPublicSettings(context.getBase44());
});

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().max(160).optional().default(""),
  phone: z.string().max(60).optional().default(""),
  message: z.string().min(5).max(4000),
  website: z.string().max(200).optional().default(""),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data, context }) => {
    if (data.website) return { ok: true };
    return submitContact(context.getBase44(), data);
  });

const adminSchema = z.object({
  action: z.string().min(1).max(64),
  token: z.string().max(200).optional().nullable(),
  payload: z.record(z.string(), z.any()).optional().nullable(),
});

export const adminApi = createServerFn({ method: "POST" })
  .validator(adminSchema)
  .handler(async ({ data, context }) => {
    return adminAction(context.getBase44(), {
      action: data.action,
      token: data.token || null,
      payload: data.payload || {},
    });
  });

// Lost access code: only the signed-in administrator of this Base44 app can
// reset it. Each deployment has its own owner account, so one shop's recovery
// can never touch another shop's dashboard.
export const recoverAdminCode = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ code: z.string().min(8).max(128) }))
  .handler(async ({ data, context }) => {
    if (context.user?.role !== "admin") {
      return {
        ok: false,
        code: "FORBIDDEN",
        error: "Only the account that owns this website can reset the access code.",
      };
    }
    return recoverCredential(context.getBase44(), data.code);
  });