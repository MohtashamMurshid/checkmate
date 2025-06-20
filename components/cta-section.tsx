import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="border-t bg-muted/20 py-24">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold">
          Ready to Fight Misinformation?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join the fight against misinformation. Start fact-checking TikTok
          content today.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="px-8">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
