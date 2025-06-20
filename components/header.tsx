import { CheckCircleIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Checkmate</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
