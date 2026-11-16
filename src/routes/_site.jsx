import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteProvider } from "@/lib/SiteContext";
import AgeGate from "@/components/site/AgeGate";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSiteSettings } from "@/lib/server-fns";

export const Route = createFileRoute("/_site")({
  loader: () => getSiteSettings(),
  component: SiteLayout,
});

function SiteLayout() {
  const settings = Route.useLoaderData();

  return (
    <SiteProvider settings={settings}>
      <AgeGate>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </AgeGate>
    </SiteProvider>
  );
}