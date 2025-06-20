import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />

      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <HeroSection />
        <HowItWorks />
        <CTASection />
      </div>

      <Footer />
    </div>
  );
}
