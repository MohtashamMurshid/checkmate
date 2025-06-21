"use client";

import { SearchCheck, Newspaper, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Controls to show in both desktop and mobile menu
  const Controls = () => (
    <>
      {pathname !== "/news" && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/news")}
            className="w-full justify-start"
          >
            <Newspaper className="h-4 w-4 mr-2" />
            {t.getNews}
          </Button>
        </div>
      )}
      <LanguageToggle />
      <ThemeToggle />
      <SignedOut>
        <SignInButton>
          <Button variant="default" size="sm" className="w-full justify-start">
            {t.signIn}
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SearchCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Checkmate</span>
          </Link>
          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-3">
            <Controls />
          </div>
          {/* Mobile menu */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex flex-col gap-4 w-56 pt-8"
              >
                <Controls />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
