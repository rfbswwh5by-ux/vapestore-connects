import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Delete", onConfirm, destructive = true, extra }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ backgroundColor: "var(--brand-surface)", border: "1px solid color-mix(in srgb, var(--brand-ink) 14%, transparent)" }}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription style={{ color: "var(--brand-muted)" }}>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {extra}
        <AlertDialogFooter>
          <AlertDialogCancel className="btn-ghost-brand !px-4 !py-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="!px-4 !py-2 font-mono text-[11px] uppercase"
            style={{
              letterSpacing: "0.14em",
              backgroundColor: destructive ? "#b91c1c" : "var(--brand-primary)",
              color: destructive ? "#fff" : "#070707",
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}