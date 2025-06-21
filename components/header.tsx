"use client";

import { SearchCheck, Newspaper } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className=" border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SearchCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Checkmate</span>
          </Link>
          <div className="flex items-center gap-3">
            {pathname !== "/news" && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/news")}
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Get News
                </Button>
              </div>
            )}
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
