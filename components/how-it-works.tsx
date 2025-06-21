"use client";
import { FeatureStep } from "@/components/feature-step";
import { useLanguage } from "@/components/language-provider";
import {
  LinkIcon,
  AudioWaveformIcon,
  SearchIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "lucide-react";

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      title: "Paste TikTok or Twitter/X Link",
      description:
        "Paste any public TikTok or Twitter/X video URL into our secure analyzer.",
      icon: LinkIcon,
      features: [
        "Works with TikTok & Twitter/X",
        "Secure URL processing",
        "No account required",
      ],
      isReversed: false,
    },
    {
      step: 2,
      title: "AI Transcription & Extraction",
      description:
        "AI extracts text from posts and transcribes video/audio using OpenAI Whisper.",
      icon: AudioWaveformIcon,
      features: [
        "OpenAI Whisper for video/audio",
        "Extracts post and video text",
        "Multi-language support",
      ],
      isReversed: true,
    },
    {
      step: 3,
      title: "News & Claim Detection",
      description:
        "Detects news, opinions, and factual claims in the content for both platforms.",
      icon: SearchIcon,
      features: [
        "AI-powered claim extraction",
        "News vs. opinion detection",
        "Works for TikTok & Twitter/X",
      ],
      isReversed: false,
    },
    {
      step: 4,
      title: "Fact-Checking & Source Analysis",
      description:
        "Verifies claims using web search, databases, and evaluates source credibility.",
      icon: ShieldCheckIcon,
      features: [
        "Web & database verification",
        "Checks claim credibility",
        "Source reliability analysis",
      ],
      isReversed: true,
    },
    {
      step: 5,
      title: "Credibility & Creator Report",
      description:
        "Get a detailed report with verdicts, sources, and creator credibility rating.",
      icon: FileTextIcon,
      features: [
        "Truth/misleading/unverifiable verdicts",
        "Linked credible sources",
        "Creator credibility rating",
        "Easy-to-read summary",
      ],
      isReversed: false,
      showArrow: false,
    },
  ];

  return (
    <section className="py-24">
      <div>
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            {t.howItWorksTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid gap-8 md:gap-12">
          {steps.map((step) => (
            <FeatureStep
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
              features={step.features}
              isReversed={step.isReversed}
              showArrow={step.showArrow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
