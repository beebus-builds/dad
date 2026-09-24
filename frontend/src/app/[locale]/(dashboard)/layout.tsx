import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageTransition } from "@/components/page-transition";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard>
      <div className="bg-muted/20 flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main
            id="main-content"
            className="dashboard-canvas bg-background/60 flex-1 overflow-y-auto"
          >
            <PageTransition>
              <div className="container max-w-screen-2xl py-6 sm:py-8">{children}</div>
            </PageTransition>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
