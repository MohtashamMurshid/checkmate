import { CheckCircleIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold">Checkmate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Checkmate. Fighting misinformation with AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
