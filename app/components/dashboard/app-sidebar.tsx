"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Car, BookOpen, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/drivers", label: "Drivers", icon: Users, exact: false },
  { href: "/app/vehicles", label: "Vehicles", icon: Car, exact: false },
  { href: "/app/methodology", label: "Methodology", icon: BookOpen, exact: false },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon
              size={15}
              strokeWidth={isActive ? 2.5 : 2}
              className={isActive ? "opacity-90" : "opacity-50"}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Supabase unavailable — still redirect home
      }
    }
    // Full navigation so middleware picks up cleared session cookies
    window.location.assign("/");
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
        <Link href="/" className="text-[14px] font-bold tracking-tight">
          FleetTribe
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute top-[53px] left-0 bottom-0 w-64 bg-sidebar border-r border-border flex flex-col p-3 shadow-lg">
            <nav className="flex-1 space-y-0.5" aria-label="Dashboard navigation">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="space-y-1 pt-2 border-t border-border">
              <ThemeToggle />
              <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LogOut size={15} className="opacity-50" strokeWidth={2} />
              Sign out
            </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col h-screen sticky top-0 border-r border-border bg-sidebar shadow-sm">
        <div className="px-5 py-5 border-b border-border">
          <Link
            href="/"
            className="block text-[14.5px] font-bold tracking-[-0.02em] text-foreground hover:opacity-60 transition-opacity"
          >
            FleetTribe
          </Link>
          <p className="text-[10.5px] text-muted-foreground mt-0.5 tracking-wide">Fleet Intelligence</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Dashboard navigation">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <LogOut size={15} className="opacity-50" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
