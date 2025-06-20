import { FeatureStep } from "@/components/feature-step";
import {
  LinkIcon,
  AudioWaveformIcon,
  SearchIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Input TikTok Link",
    description:
      "Simply paste any TikTok video URL into our secure input field",
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
    title: "Audio Transcription",
    description:
      "AI-powered transcription extracts and converts speech to text",
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
    title: "News Detection",
    description: "AI classifies content to identify news and factual claims",
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
    title: "Research & Fact-Check",
    description: "Cross-reference claims with credible sources and databases",
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
    title: "Credibility Report",
    description:
      "Get a comprehensive report with sources and verification status",
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

export function HowItWorks() {
  return (
    <section className="py-24">
      <div>
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Our 5-step process ensures comprehensive fact-checking
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
