import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const linkParam = typeof params.link === "string" ? params.link : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />

      <div className="pt-16">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <HeroSection initialUrl={linkParam} />
          <HowItWorks />
        </div>

        <CTASection />

        <Footer />
      </div>
    </div>
  );
}
