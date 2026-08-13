"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Overview", href: "/" },
  { label: "Drivers", href: "/app/drivers" },
  { label: "Vehicles", href: "/app/vehicles" },
  { label: "Methodology", href: "/app/methodology" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[960px]">
      <nav
        className={`rounded-full px-5 py-2 flex items-center justify-between transition-all duration-500 ${
          scrolled ? "glass-navbar-scrolled" : "glass-navbar"
        }`}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Brand */}
        <Link
          href="/"
          className="text-[14.5px] font-bold tracking-[-0.02em] text-foreground hover:opacity-60 transition-opacity duration-200"
        >
          FleetTribe
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => {
            const isActive = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-150 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-1.5">
          <ThemeToggle compact />
          <Link
            href="/auth"
            className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/app"
            className="px-4 py-1.5 text-[12.5px] font-semibold bg-foreground text-background rounded-full hover:opacity-80 transition-opacity duration-150"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile */}
        <button
          className="md:hidden p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={17} strokeWidth={2.5} /> : <Menu size={17} strokeWidth={2.5} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div
          id="mobile-menu"
          role="menu"
          className="md:hidden mt-2 glass-navbar rounded-2xl px-3 py-3 flex flex-col"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground rounded-xl transition-colors duration-150"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 pt-2.5 border-t border-border/60 flex flex-col gap-1">
            <div className="px-3 py-1">
              <ThemeToggle />
            </div>
            <Link
              href="/auth"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/app"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-[14px] font-semibold bg-foreground text-background rounded-xl text-center hover:opacity-80 transition-opacity"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
