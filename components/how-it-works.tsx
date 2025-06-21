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
      title: t.inputTikTokLink,
      description: t.inputTikTokLinkDesc,
      icon: LinkIcon,
      features: [
        "Secure URL processing",
        "Works with any public TikTok video",
        "No account required",
      ],
      isReversed: false,
    },
    {
      step: 2,
      title: t.audioTranscription,
      description: t.audioTranscriptionDesc,
      icon: AudioWaveformIcon,
      features: [
        "OpenAI Whisper technology",
        "Multiple language support",
        "High accuracy transcription",
      ],
      isReversed: true,
    },
    {
      step: 3,
      title: t.newsDetection2,
      description: t.newsDetectionDesc,
      icon: SearchIcon,
      features: [
        "BERT-based classification",
        "News vs. opinion detection",
        "Claim extraction",
      ],
      isReversed: false,
    },
    {
      step: 4,
      title: t.researchFactCheck,
      description: t.researchFactCheckDesc,
      icon: ShieldCheckIcon,
      features: [
        "Web search verification",
        "Fact-checking database lookup",
        "Source credibility analysis",
      ],
      isReversed: true,
    },
    {
      step: 5,
      title: t.credibilityReport,
      description: t.credibilityReportDesc,
      icon: FileTextIcon,
      features: [
        "Truth/misleading/unverifiable labels",
        "Linked credible sources",
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
