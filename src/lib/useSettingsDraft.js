import { useState } from "react";
import { toast } from "sonner";
import { useAdmin } from "@/lib/AdminContext";
import { mergedSettings } from "@/lib/siteDefaults";

export function useSettingsDraft() {
  const { settings, saveSettings } = useAdmin();
  const [draft, setDraft] = useState(() => mergedSettings(settings));
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const patch = (values) => setDraft((prev) => ({ ...prev, ...values }));

  const save = async (message = "Saved. Your website is updated.") => {
    setSaving(true);
    try {
      const res = await saveSettings(draft);
      if (res?.ok) toast.success(message);
      else toast.error(res?.error || "Could not save those changes.");
      return res;
    } catch {
      toast.error("Could not save those changes. Please try again.");
      return { ok: false };
    } finally {
      setSaving(false);
    }
  };

  return { draft, set, patch, save, saving, settings };
}