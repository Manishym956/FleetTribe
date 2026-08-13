"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("fleettribe-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("fleettribe-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) {
    return <div className={compact ? "h-9 w-9" : "h-9 w-full"} aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={
        compact
          ? "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          : "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
      }
    >
      {theme === "light" ? (
        <>
          <Moon size={15} strokeWidth={2} className="opacity-70" />
          {!compact && "Dark mode"}
        </>
      ) : (
        <>
          <Sun size={15} strokeWidth={2} className="opacity-70" />
          {!compact && "Light mode"}
        </>
      )}
    </button>
  );
}
