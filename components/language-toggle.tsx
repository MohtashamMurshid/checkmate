"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: "en" as const, label: t.english, flag: "🇺🇸" },
    { code: "ms" as const, label: t.malay, flag: "🇲🇾" },
    { code: "zh" as const, label: t.chinese, flag: "🇨🇳" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t.toggleLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
