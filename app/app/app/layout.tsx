import AppSidebar from "@/components/dashboard/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-auto pt-[53px] md:pt-0">
        {children}
      </main>
    </div>
  );
}
