"use client";

import { AllAnalyses } from "@/components/all-analyses";
import { useSaveTikTokAnalysis } from "@/lib/hooks/use-saved-analyses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Database, Plus } from "lucide-react";
import { toast } from "sonner";

// Analysis structure that matches the convex schema for database storage
type MockAnalysis = {
  videoUrl: string;
  transcription?: {
    text: string;
    duration?: number;
    language?: string;
  };
  metadata?: {
    title: string;
    description?: string;
    creator?: string;
    originalUrl: string;
    contentType?: string;
    platform?: string;
  };
  newsDetection?: {
    hasNewsContent: boolean;
    confidence: number;
    newsKeywordsFound: string[];
    potentialClaims: string[];
    needsFactCheck: boolean;
    contentType: string;
  };
  factCheck?: {
    totalClaims: number;
    checkedClaims: number;
    results: {
      claim: string;
      status: string;
      confidence: number;
      analysis?: string;
      sources: string[];
      error?: string;
    }[];
    summary: {
      verifiedTrue: number;
      verifiedFalse: number;
      misleading: number;
      unverifiable: number;
      needsVerification: number;
    };
  };
  requiresFactCheck: boolean;
};

export default function NewsPage() {
  const saveTikTokAnalysis = useSaveTikTokAnalysis();
  const [isAdding, setIsAdding] = useState(false);

  const addMockData = async () => {
    setIsAdding(true);
    toast.info("Adding mock data... please wait.");
    try {
      // Mock analysis data - matching tiktok-analysis.ts format
      const mockAnalyses = [
        {
          videoUrl: "https://www.tiktok.com/@cnn/video/7234567890123456789",
          metadata: {
            title: "Breaking: New Diabetes Treatment Discovered",
            description: "Scientists announce breakthrough diabetes treatment",
            creator: "CNN",
            originalUrl:
              "https://www.tiktok.com/@cnn/video/7234567890123456789",
            contentType: "video",
            platform: "tiktok",
          },
          transcription: {
            text: "Breaking news: Scientists have discovered a new treatment for diabetes that could revolutionize healthcare. The study published in Nature shows promising results with a 95% success rate in clinical trials.",
            duration: 45,
            language: "en",
          },
          newsDetection: {
            hasNewsContent: true,
            confidence: 0.95,
            newsKeywordsFound: [
              "breaking",
              "scientists",
              "study",
              "clinical trials",
            ],
            potentialClaims: [
              "Scientists have discovered a new treatment for diabetes",
              "The study was published in Nature",
              "95% success rate in clinical trials",
            ],
            needsFactCheck: true,
            contentType: "news_factual",
          },
          factCheck: {
            totalClaims: 3,
            checkedClaims: 3,
            results: [
              {
                claim:
                  "Scientists have discovered a new treatment for diabetes",
                status: "requires_verification",
                confidence: 0.7,
                analysis:
                  "While diabetes research is ongoing, no major breakthrough has been confirmed by medical authorities. This claim needs verification from credible medical sources.",
                sources: [
                  "https://www.nature.com/search?q=diabetes",
                  "https://www.jdrf.org/blog/",
                ],
              },
              {
                claim: "The study was published in Nature",
                status: "false",
                confidence: 0.9,
                analysis:
                  "No recent diabetes breakthrough study has been published in Nature journal. This appears to be misinformation.",
                sources: ["https://www.nature.com/"],
              },
              {
                claim: "95% success rate in clinical trials",
                status: "unverifiable",
                confidence: 0.8,
                analysis:
                  "No verifiable clinical trial data supports this claim. Medical claims require peer-reviewed evidence.",
                sources: [],
              },
            ],
            summary: {
              verifiedTrue: 0,
              verifiedFalse: 1,
              misleading: 0,
              unverifiable: 1,
              needsVerification: 1,
            },
          },
          requiresFactCheck: true,
        },
        {
          videoUrl:
            "https://www.tiktok.com/@techcrunch/video/7234567890123456790",
          metadata: {
            title: "iPhone 15 Mind-Reading Camera Announced",
            description: "Apple's new iPhone can read thoughts",
            creator: "TechCrunch",
            originalUrl:
              "https://www.tiktok.com/@techcrunch/video/7234567890123456790",
            contentType: "video",
            platform: "tiktok",
          },
          transcription: {
            text: "Apple just announced the iPhone 15 will have a revolutionary new camera system with AI-powered photography that can see through walls and read minds. Pre-orders start tomorrow!",
            duration: 30,
            language: "en",
          },
          newsDetection: {
            hasNewsContent: true,
            confidence: 0.85,
            newsKeywordsFound: [
              "Apple",
              "announced",
              "iPhone 15",
              "revolutionary",
            ],
            potentialClaims: [
              "Apple announced iPhone 15 with revolutionary camera",
              "Camera can see through walls",
              "AI can read minds",
              "Pre-orders start tomorrow",
            ],
            needsFactCheck: true,
            contentType: "news_factual",
          },
          factCheck: {
            totalClaims: 4,
            checkedClaims: 4,
            results: [
              {
                claim: "Apple announced iPhone 15 with revolutionary camera",
                status: "misleading",
                confidence: 0.8,
                analysis:
                  "While Apple did announce the iPhone 15, the claims about the camera capabilities are exaggerated and not based on official announcements.",
                sources: ["https://www.apple.com/newsroom/"],
              },
              {
                claim: "Camera can see through walls",
                status: "false",
                confidence: 0.95,
                analysis:
                  "This is physically impossible with current smartphone technology. No camera can see through solid walls.",
                sources: [],
              },
              {
                claim: "AI can read minds",
                status: "false",
                confidence: 0.99,
                analysis:
                  "Mind reading technology does not exist in consumer devices. This is scientifically impossible.",
                sources: [],
              },
              {
                claim: "Pre-orders start tomorrow",
                status: "requires_verification",
                confidence: 0.6,
                analysis:
                  "Pre-order dates should be verified against official Apple announcements.",
                sources: [],
              },
            ],
            summary: {
              verifiedTrue: 0,
              verifiedFalse: 2,
              misleading: 1,
              unverifiable: 0,
              needsVerification: 1,
            },
          },
          requiresFactCheck: true,
        },
        {
          videoUrl:
            "https://www.tiktok.com/@cooking_with_sarah/video/7234567890123456791",
          metadata: {
            title: "Grandmother's Secret Chocolate Chip Cookies",
            description:
              "Learn to make amazing cookies with this family recipe",
            creator: "Cooking with Sarah",
            originalUrl:
              "https://www.tiktok.com/@cooking_with_sarah/video/7234567890123456791",
            contentType: "video",
            platform: "tiktok",
          },
          transcription: {
            text: "Today I'm making my grandmother's famous chocolate chip cookies! The secret is using brown butter and a pinch of sea salt. Let me show you how to make them step by step.",
            duration: 60,
            language: "en",
          },
          newsDetection: {
            hasNewsContent: false,
            confidence: 0.2,
            newsKeywordsFound: [],
            potentialClaims: [],
            needsFactCheck: false,
            contentType: "lifestyle_cooking",
          },
          factCheck: undefined,
          requiresFactCheck: false,
        },
      ];

      // Add each mock analysis
      for (const mockData of mockAnalyses) {
        await saveTikTokAnalysis(mockData as MockAnalysis);
      }

      toast.success("✅ Mock data added successfully!");
    } catch (error) {
      console.error("Failed to add mock data:", error);
      toast.error("Failed to add mock data. Check the console for details.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Mock Data Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Analyses Dashboard</h1>
          <p className="text-muted-foreground">
            View all TikTok fact-checking analyses
          </p>
        </div>

        <Card className="w-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Developer Tools
            </CardTitle>
            <CardDescription className="text-xs">
              Add sample data for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={addMockData}
              disabled={isAdding}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2" />
              ) : (
                <Plus className="h-3 w-3 mr-2" />
              )}
              Add Mock Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Saved Analyses Component */}
      <AllAnalyses />
    </div>
  );
}
