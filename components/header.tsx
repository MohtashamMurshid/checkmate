"use client";

import { SearchCheck, Newspaper } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_0_16px_2px_rgba(236,72,153,0.12)] before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:z-[-1] before:shadow-[0_2px_16px_4px_rgba(236,72,153,0.08)] dark:shadow-[0_0_24px_4px_rgba(219,39,119,0.18)] dark:before:shadow-[0_4px_32px_8px_rgba(219,39,119,0.12)] transition-all duration-300 ${
      isScrolled 
        ? 'py-1 shadow-lg' 
        : 'py-0'
    }`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-12' : 'h-16'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground animate-pulse transition-all duration-300 ${
              isScrolled ? 'h-6 w-6' : 'h-8 w-8'
            }`}>
              <SearchCheck className={`animate-pulse transition-all duration-300 ${
                isScrolled ? 'h-3.5 w-3.5' : 'h-5 w-5'
              }`} style={{ animationDuration: '2s' }} />
            </div>
            <span className={`font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse hover:from-primary/80 hover:via-primary hover:to-primary/80 transition-all duration-500 hover:scale-105 cursor-default ${
              isScrolled ? 'text-lg' : 'text-xl'
            }`}>
              Checkmate
            </span>
          </div>
          <div className={`flex items-center transition-all duration-300 ${
            isScrolled ? 'gap-2' : 'gap-3'
          }`}>
            <Button
              variant="outline"
              size={isScrolled ? "sm" : "sm"}
              onClick={() => router.push("/news")}
              className={`transition-all duration-300 ${
                isScrolled ? 'h-8 px-2 text-xs' : ''
              }`}
            >
              <Newspaper className={`mr-2 transition-all duration-300 ${
                isScrolled ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
              <span className={isScrolled ? 'hidden sm:inline' : ''}>Get News</span>
            </Button>
            <ThemeToggle />

            <SignedOut>
              <SignInButton>
                <Button 
                  variant="default" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    isScrolled ? 'h-8 px-2 text-xs' : ''
                  }`}
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className={`transition-all duration-300 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
