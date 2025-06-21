"use client";

import { SearchCheck, Newspaper } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_0_16px_2px_rgba(236,72,153,0.12)] before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:z-[-1] before:shadow-[0_2px_16px_4px_rgba(236,72,153,0.08)] dark:shadow-[0_0_24px_4px_rgba(219,39,119,0.18)] dark:before:shadow-[0_4px_32px_8px_rgba(219,39,119,0.12)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SearchCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Checkmate</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/news")}
            >
              <Newspaper className="h-4 w-4 mr-2" />
              Get News
            </Button>
            <ThemeToggle />

            <SignedOut>
              <SignInButton>
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
