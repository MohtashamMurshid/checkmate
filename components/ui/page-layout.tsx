import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  includeFooter?: boolean;
  variant?: "default" | "gradient" | "simple";
}

export function PageLayout({
  children,
  className,
  includeFooter = true,
  variant = "default",
}: PageLayoutProps) {
  const variants = {
    default: "min-h-screen bg-background",
    gradient: "min-h-screen bg-gradient-to-br from-background to-muted/20",
    simple: "min-h-screen bg-background",
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div className="mx-auto max-w-5xl px-4 md:px-6">{children}</div>
      {includeFooter && <Footer />}
    </div>
  );
}
