import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { CTASection } from "@/components/cta-section";

interface HomePageContentProps {
  initialUrl?: string;
}

export function HomePageContent({ initialUrl = "" }: HomePageContentProps) {
  return (
    <>
      <HeroSection initialUrl={initialUrl} />
      <HowItWorks />
      <CTASection />
    </>
  );
}
