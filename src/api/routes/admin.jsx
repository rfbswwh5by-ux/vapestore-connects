import { useState } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminProvider, useAdmin } from "@/lib/AdminContext";
import { SiteProvider } from "@/lib/SiteContext";
import AdminGate from "@/components/admin/AdminGate";
import AdminSidebar, { AdminTopbar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});

const TITLES = {
  "/admin": "Overview",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/homepage": "Homepage",
  "/admin/branding": "Branding",
  "/admin/appearance": "Appearance",
  "/admin/store": "Store information",
  "/admin/faq": "FAQ",
  "/admin/messages": "Messages",
  "/admin/team": "Team access",
  "/admin/settings": "SEO & legal",
  "/admin/security": "Security",
};

function AdminLayout() {
  return (
    <AdminProvider>
      <AdminFrame />
    </AdminProvider>
  );
}

function AdminFrame() {
  const { status, settings } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || "Dashboard";

  if (status !== "unlocked") {
    return (
      <SiteProvider settings={settings || {}}>
        <AdminGate />
      </SiteProvider>
    );
  }

  return (
    <SiteProvider settings={settings || {}}>
      <div className="flex min-h-screen">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="min-w-0 flex-1">
          <AdminTopbar title={title} onOpenMenu={() => setMenuOpen(true)} />
          <div className="px-5 py-8 lg:px-8 lg:py-10">
            <Outlet />
          </div>
        </div>
      </div>
    </SiteProvider>
  );
}