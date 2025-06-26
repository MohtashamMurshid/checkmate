"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PlayIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookmarkIcon,
} from "lucide-react";
import { useTikTokAnalysis } from "@/lib/hooks/use-tiktok-analysis";
import { useSaveTikTokAnalysisWithCredibility } from "@/lib/hooks/use-saved-analyses";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { AnalysisRenderer } from "@/components/analysis-renderer";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";

interface HeroSectionProps {
  initialUrl?: string;
}

interface FactCheckResult {
  verdict: string;
  confidence: number;
  explanation: string;
  sources: Array<{
    title: string;
    url: string;
    source: string;
    relevance?: number;
  }>;
  content: string;
  isVerified: boolean;
  error?: string;
}

export function HeroSection({ initialUrl = "" }: HeroSectionProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [mockResult, setMockResult] = useState<{
    success: boolean;
    data: {
      transcription: {
        text: string;
        segments: unknown[];
        language: string;
      };
      metadata: {
        title: string;
        description: string;
        creator: string;
        originalUrl: string;
        platform: string;
      };
      factCheck: {
        verdict: string;
        confidence: number;
        explanation: string;
        content: string;
        sources: Array<{
          title: string;
          url: string;
          source: string;
          relevance: number;
        }>;
        isVerified: boolean;
      };
      requiresFactCheck: boolean;
      creatorCredibilityRating: number;
      newsDetection: {
        hasNewsContent: boolean;
        confidence: number;
        newsKeywordsFound: string[];
        potentialClaims: number;
        needsFactCheck: boolean;
        contentType: string;
      };
    };
  } | null>(null);
  const { analyzeTikTok, isLoading, result, reset } = useTikTokAnalysis();
  const { isAuthenticated } = useConvexAuth();
  const saveTikTokAnalysisWithCredibility =
    useSaveTikTokAnalysisWithCredibility();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (result) {
      if (result.success) {
        toast.success(t.analysisComplete);
      } else if (result.error) {
        toast.error(result.error);
      }
    }
  }, [result, t]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error(t.enterUrl);
      return;
    }

    // Update URL with query parameter
    const params = new URLSearchParams();
    params.set("link", url.trim());
    router.replace(`?${params.toString()}`);

    toast.info(t.analysisStarted);
    await analyzeTikTok(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAnalyze();
  };

  const handleReset = () => {
    setUrl("");
    setIsAnalysisExpanded(false);
    setIsSaved(false);
    setMockResult(null);
    reset();
  };

  const handleMockAnalysis = async () => {
    if (!url.trim()) {
      toast.error(t.enterUrl);
      return;
    }

    setIsMockLoading(true);
    toast.info("🧪 Running Mock Analysis (Free!)");

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate realistic mock data
    const mockData = {
      success: true,
      data: {
        transcription: {
          text: `This is a mock transcription of the content from ${url}. 

The AI has simulated transcribing the audio/video content. In this mock analysis, we're demonstrating how the system would extract spoken words, identify key claims, and prepare them for fact-checking.

Key simulated claims found:
- Mock claim about current events
- Simulated statement requiring verification
- Example of content that would trigger fact-checking processes`,
          segments: [],
          language: "en",
        },
        metadata: {
          title: "Mock Content Analysis - Demo Mode",
          description:
            "This is a simulated analysis showing how Checkmate would process real content without using expensive APIs.",
          creator: "MockCreator123",
          originalUrl: url,
          platform: url.includes("tiktok")
            ? "tiktok"
            : url.includes("twitter")
              ? "twitter"
              : "web",
        },
        factCheck: {
          verdict: "verified" as const,
          confidence: 85,
          explanation: `**Mock Fact-Check Analysis:**

This is a demonstration of how our AI fact-checking system would analyze the content. In a real scenario, this would involve:

**Verification Process:**
- Web search across credible news sources
- Cross-referencing with fact-checking databases  
- Analysis of source credibility and bias
- Evaluation of evidence quality

**Mock Findings:**
- **Primary Claims**: The content contains 2-3 verifiable statements
- **Source Quality**: Simulated cross-reference with Reuters, AP News, BBC
- **Confidence Level**: High confidence based on multiple corroborating sources
- **Recommendation**: Content appears to be factually accurate based on available evidence

**Note**: This is a demonstration using mock data to show the analysis process without incurring API costs.`,
          content:
            "Mock content summary: The system has analyzed the provided URL and generated this demo fact-check result to show how real analysis would work.",
          sources: [
            {
              title: "Mock Reuters Article",
              url: "https://reuters.com/mock-article",
              source: "reuters.com",
              relevance: 0.9,
            },
            {
              title: "Mock BBC News Report",
              url: "https://bbc.com/mock-report",
              source: "bbc.com",
              relevance: 0.85,
            },
            {
              title: "Mock AP News Coverage",
              url: "https://apnews.com/mock-coverage",
              source: "apnews.com",
              relevance: 0.8,
            },
          ],
          isVerified: true,
        },
        requiresFactCheck: true,
        creatorCredibilityRating: 7.2,
        newsDetection: {
          hasNewsContent: true,
          confidence: 0.9,
          newsKeywordsFound: ["breaking", "reports", "officials"],
          potentialClaims: 3,
          needsFactCheck: true,
          contentType: "news_factual",
        },
      },
    };

    setMockResult(mockData);
    setIsMockLoading(false);
    toast.success("🎭 Mock Analysis Complete! (No API costs incurred)");
  };

  const handleSaveAnalysis = async () => {
    if (!result?.success || !result.data || !isAuthenticated) {
      toast.error(t.cannotSave);
      return;
    }

    // Check if already saved by the automatic save in useTikTokAnalysis hook
    // This prevents duplicate saves
    if (isSaved) {
      toast.info(t.alreadySaved);
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the data for saving, mapping to schema format
      const saveData = {
        videoUrl: result.data.metadata.originalUrl,
        transcription: result.data.transcription
          ? {
              text: result.data.transcription.text,
              language: result.data.transcription.language,
              // Note: duration not available from API yet, will be undefined
            }
          : undefined,
        metadata: result.data.metadata
          ? {
              title: result.data.metadata.title,
              description: result.data.metadata.description,
              creator: result.data.metadata.creator,
              originalUrl: result.data.metadata.originalUrl,
              platform: result.data.metadata.platform,
            }
          : undefined,
        newsDetection: result.data.newsDetection
          ? {
              hasNewsContent: result.data.newsDetection.hasNewsContent,
              confidence: result.data.newsDetection.confidence,
              newsKeywordsFound: result.data.newsDetection.newsKeywordsFound,
              potentialClaims: result.data.newsDetection.potentialClaims,
              needsFactCheck: result.data.newsDetection.needsFactCheck,
              contentType: result.data.newsDetection.contentType,
            }
          : undefined,
        factCheck: result.data.factCheck
          ? {
              // Map from FactCheckResult to schema format
              verdict: (result.data.factCheck as unknown as FactCheckResult)
                .verdict,
              confidence: (result.data.factCheck as unknown as FactCheckResult)
                .confidence,
              explanation: (result.data.factCheck as unknown as FactCheckResult)
                .explanation,
              content: (result.data.factCheck as unknown as FactCheckResult)
                .content,
              isVerified: (result.data.factCheck as unknown as FactCheckResult)
                .isVerified,
              sources: (
                result.data.factCheck as unknown as FactCheckResult
              ).sources?.map((source) => ({
                title: source.title,
                url: source.url,
                source: source.source,
                relevance: source.relevance,
              })),
              error: (result.data.factCheck as unknown as FactCheckResult)
                .error,
            }
          : undefined,
        requiresFactCheck: result.data.requiresFactCheck,
        // Use creator credibility rating if available, or default to neutral rating
        creatorCredibilityRating: result.data.creatorCredibilityRating || 5.0,
      };

      // Use enhanced save function to properly handle content creators
      await saveTikTokAnalysisWithCredibility(saveData);

      setIsSaved(true);
      toast.success(t.analysisSaved);
    } catch (error) {
      console.error("Failed to save analysis:", error);
      toast.error(t.failedToSave);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "true":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "false":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case "misleading":
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case "unverifiable":
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircleIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "true":
        return (
          <Badge className="bg-green-100 text-green-800">Verified True</Badge>
        );
      case "false":
        return <Badge className="bg-red-100 text-red-800">False</Badge>;
      case "misleading":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Misleading</Badge>
        );
      case "unverifiable":
        return (
          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            Unverifiable
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            Needs Verification
          </Badge>
        );
    }
  };

  return (
    <section className="py-24 md:py-32 relative">
      {/* Analysis Loading Overlay */}
      {(isLoading || isMockLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-auto shadow-2xl border-primary border-2 animate-in fade-in-0 zoom-in-95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <LoaderIcon className="h-6 w-6 animate-spin" />
                Analyzing Content...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={70} />
              <div className="text-base text-muted-foreground text-center">
                <p>
                  We are transcribing the video, detecting news content, and
                  fact-checking claims using AI.
                </p>
                <p className="mt-2">
                  This may take up to a minute for longer videos. Please don’t
                  close this tab.
                </p>
                <p className="mt-4 text-xs text-gray-400">
                  Checkmate is verifying sources, analyzing credibility, and
                  summarizing results for you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Fact Checking
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t.heroSubtitle}
        </p>
        <div className="mx-auto max-w-2xl space-y-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 items-center justify-center"
          >
            <Input
              placeholder={t.urlPlaceholder}
              className="flex-1 h-12 text-base min-w-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading || isMockLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="px-6 h-12 shrink-0"
              disabled={isLoading || isMockLoading || !url.trim()}
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {isLoading ? t.analyzing : t.analyzeButton}
            </Button>
          </form>

          {/* Mock Analysis Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleMockAnalysis}
              variant="outline"
              size="lg"
              className="px-6 h-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600"
              disabled={isLoading || isMockLoading || !url.trim()}
            >
              {isMockLoading ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <span className="mr-2">🧪</span>
              )}
              {isMockLoading ? "Running Mock..." : "Try Mock Demo (Free!)"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Try it with any TikTok/Twitter(X) video URL to see the magic happen
          </p>

          {/* Mock Demo Description */}
          <div className="text-center">
            <p className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg inline-block">
              💡 The mock demo simulates the full analysis process with
              realistic data—perfect for testing without API costs!
            </p>
          </div>
        </div>

        {/* Results */}
        {(result || mockResult) && (
          <div className="mx-auto max-w-4xl mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result?.success || mockResult?.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {result?.success || mockResult?.success
                    ? mockResult
                      ? "🧪 Mock Analysis Complete"
                      : t.analysisComplete
                    : "Analysis Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(result?.success && result.data) ||
                (mockResult?.success && mockResult.data) ? (
                  (() => {
                    // Determine which data source to use
                    const currentData =
                      result?.success && result.data
                        ? result.data
                        : mockResult?.data;
                    if (!currentData) return null;

                    return (
                      <div className="space-y-6 text-left">
                        {/* Video Metadata */}
                        <div className="border-b pb-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {currentData.metadata.title}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Creator: {currentData.metadata.creator}</p>
                            <p>
                              Platform:{" "}
                              {currentData.metadata.platform || "Unknown"}
                            </p>
                            <p>
                              Original URL: {currentData.metadata.originalUrl}
                            </p>
                            {currentData.metadata.description &&
                              currentData.metadata.description !==
                                currentData.metadata.title && (
                                <p>
                                  Description:{" "}
                                  {currentData.metadata.description}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Transcription */}
                        {currentData.transcription &&
                          currentData.transcription.text &&
                          currentData.transcription.text.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4" />
                                Transcription
                              </h4>
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="text-sm leading-relaxed">
                                  <AnalysisRenderer
                                    content={currentData.transcription.text}
                                  />
                                </div>
                                {currentData.transcription.language && (
                                  <p className="text-xs text-muted-foreground mt-3">
                                    Language:{" "}
                                    {currentData.transcription.language}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Platform Analysis */}
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <AlertCircleIcon className="h-4 w-4" />
                            Platform Analysis
                          </h4>
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Source Platform:</span>
                              <Badge variant="secondary">
                                {currentData.metadata.platform === "twitter"
                                  ? "Twitter/X"
                                  : "TikTok"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Content Type:</span>
                              <Badge variant="outline">
                                {currentData.metadata.platform === "twitter"
                                  ? "Social Post"
                                  : "Video Content"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                Fact-Check Required:
                              </span>
                              <Badge
                                variant={
                                  currentData.requiresFactCheck
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {currentData.requiresFactCheck ? "Yes" : "No"}
                              </Badge>
                            </div>
                            {currentData.factCheck && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Verification Status:
                                </span>
                                <Badge
                                  variant={
                                    (
                                      currentData.factCheck as unknown as FactCheckResult
                                    ).isVerified
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {(
                                    currentData.factCheck as unknown as FactCheckResult
                                  ).isVerified
                                    ? "Verified"
                                    : "Pending"}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* News Detection */}
                        {currentData.newsDetection && (
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertCircleIcon className="h-4 w-4" />
                              Content Analysis
                            </h4>
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Content Type:</span>
                                <Badge
                                  variant={
                                    currentData.newsDetection.contentType ===
                                    "news_factual"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {currentData.newsDetection.contentType ===
                                  "news_factual"
                                    ? "News/Factual"
                                    : "Entertainment"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Requires Fact-Check:
                                </span>
                                <Badge
                                  variant={
                                    currentData.requiresFactCheck
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {currentData.requiresFactCheck ? "Yes" : "No"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Confidence:</span>
                                <span className="text-sm font-medium">
                                  {Math.round(
                                    currentData.newsDetection.confidence * 100
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fact-Check Results */}
                        {currentData.factCheck && (
                          <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <ShieldCheckIcon className="h-4 w-4" />
                              Fact-Check Results
                            </h4>

                            {/* Overall Verification Status */}
                            <Card
                              className={`border-l-4 ${
                                (
                                  currentData.factCheck as unknown as FactCheckResult
                                ).verdict === "true"
                                  ? "border-l-green-500"
                                  : (
                                        currentData.factCheck as unknown as FactCheckResult
                                      ).verdict === "false"
                                    ? "border-l-red-500"
                                    : (
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).verdict === "misleading"
                                      ? "border-l-yellow-500"
                                      : "border-l-gray-500"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm mb-2">
                                        Overall Verification Status
                                      </h5>
                                      <div className="text-sm text-muted-foreground">
                                        {(
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).content && (
                                          <AnalysisRenderer
                                            content={
                                              (
                                                currentData.factCheck as unknown as FactCheckResult
                                              ).content
                                            }
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {getStatusIcon(
                                        (
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).verdict
                                      )}
                                      {getStatusBadge(
                                        (
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).verdict
                                      )}
                                    </div>
                                  </div>

                                  {(
                                    currentData.factCheck as unknown as FactCheckResult
                                  ).explanation && (
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                      <p className="font-medium mb-3 text-base">
                                        Analysis:
                                      </p>
                                      <div>
                                        {(() => {
                                          const explanation = (
                                            currentData.factCheck as unknown as FactCheckResult
                                          ).explanation;
                                          const shouldTruncate =
                                            explanation.length > 500;

                                          const contentToShow =
                                            shouldTruncate &&
                                            !isAnalysisExpanded
                                              ? explanation.substring(0, 500) +
                                                "..."
                                              : explanation;

                                          return (
                                            <AnalysisRenderer
                                              content={contentToShow}
                                            />
                                          );
                                        })()}
                                      </div>
                                      {(() => {
                                        const explanation = (
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).explanation;

                                        if (explanation.length <= 500)
                                          return null;

                                        return (
                                          <button
                                            onClick={() =>
                                              setIsAnalysisExpanded(
                                                !isAnalysisExpanded
                                              )
                                            }
                                            className="mt-4 text-primary hover:text-primary/80 font-medium transition-colors text-sm flex items-center gap-1"
                                          >
                                            {isAnalysisExpanded ? (
                                              <>
                                                <ChevronUpIcon className="h-4 w-4" />
                                                Show less
                                              </>
                                            ) : (
                                              <>
                                                <ChevronDownIcon className="h-4 w-4" />
                                                Show more
                                              </>
                                            )}
                                          </button>
                                        );
                                      })()}
                                    </div>
                                  )}

                                  {(
                                    currentData.factCheck as unknown as FactCheckResult
                                  ).sources &&
                                    (
                                      currentData.factCheck as unknown as FactCheckResult
                                    ).sources.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium mb-2">
                                          Sources (
                                          {
                                            (
                                              currentData.factCheck as unknown as FactCheckResult
                                            ).sources.length
                                          }{" "}
                                          found):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(
                                            currentData.factCheck as unknown as FactCheckResult
                                          ).sources
                                            .slice(0, 5)
                                            .map((source, sourceIndex) => (
                                              <Button
                                                key={sourceIndex}
                                                size="sm"
                                                variant="outline"
                                                asChild
                                              >
                                                <a
                                                  href={source.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs"
                                                >
                                                  {source.source}
                                                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                                                </a>
                                              </Button>
                                            ))}
                                        </div>
                                      </div>
                                    )}

                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                      Confidence:{" "}
                                      {
                                        (
                                          currentData.factCheck as unknown as FactCheckResult
                                        ).confidence
                                      }
                                      %
                                    </span>
                                    <span>
                                      Verified:{" "}
                                      {(
                                        currentData.factCheck as unknown as FactCheckResult
                                      ).isVerified
                                        ? "Yes"
                                        : "No"}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 border-t">
                          <div className="flex gap-3 flex-wrap">
                            {/* Save Button - Only show for authenticated users */}
                            {isAuthenticated && (
                              <Button
                                onClick={handleSaveAnalysis}
                                disabled={isSaving || isSaved}
                                className="flex items-center gap-2"
                              >
                                {isSaving ? (
                                  <LoaderIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <BookmarkIcon className="h-4 w-4" />
                                )}
                                {isSaved
                                  ? t.saved
                                  : isSaving
                                    ? t.saving
                                    : t.saveAnalysis}
                              </Button>
                            )}

                            <Button variant="outline" onClick={handleReset}>
                              {t.reset}
                            </Button>
                          </div>

                          {/* Login prompt for non-authenticated users */}
                          {!isAuthenticated && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <Link
                                href="/sign-in"
                                className="text-primary hover:underline"
                              >
                                Sign in
                              </Link>{" "}
                              to save your analysis results
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-left">
                    <p className="text-red-500 mb-4">{result?.error}</p>
                    <Button variant="outline" onClick={handleReset}>
                      {t.tryAgain}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
