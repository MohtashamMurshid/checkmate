"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  // Determine the next theme
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={t.toggleTheme}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">{t.toggleTheme}</span>
    </Button>
  );
}
