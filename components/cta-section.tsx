"use client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="border-t bg-muted/20 py-24">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold">{t.ctaTitle}</h2>
        <p className="mb-8 text-lg text-muted-foreground">{t.ctaDescription}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="px-8">
            {t.getStarted}
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            {t.learnMore}
          </Button>
        </div>
      </div>
    </section>
  );
}
