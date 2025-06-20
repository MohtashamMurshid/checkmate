import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlayIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Fact Checking
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Verify TikTok Content with{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Checkmate
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Combat misinformation with our AI-powered fact-checking tool. Paste
          any TikTok link to get instant transcription, news detection, and
          credibility reports with verified sources.
        </p>

        {/* Demo Input */}
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex gap-3 items-center justify-center">
            <Input
              placeholder="Paste TikTok link here..."
              className="flex-1 h-12 text-base min-w-0"
            />
            <Button size="lg" className="px-6 h-12 shrink-0">
              <PlayIcon className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Try it with any TikTok video URL to see the magic happen
          </p>
        </div>
      </div>
    </section>
  );
}
