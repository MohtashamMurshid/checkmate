"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSaveTikTokAnalysis } from "@/lib/hooks/use-saved-analyses";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { AnalysisRenderer } from "@/components/analysis-renderer";
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
  const { analyzeTikTok, isLoading, result, reset } = useTikTokAnalysis();
  const { isAuthenticated } = useConvexAuth();
  const saveTikTokAnalysis = useSaveTikTokAnalysis();
  const router = useRouter();

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (result) {
      if (result.success) {
        toast.success("Analysis complete!");
      } else if (result.error) {
        toast.error(result.error);
      }
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to analyze.");
      return;
    }

    // Update URL with query parameter
    const params = new URLSearchParams();
    params.set("link", url.trim());
    router.replace(`?${params.toString()}`);

    toast.info("Starting analysis... This may take a moment.");
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
    reset();
  };

  const handleSaveAnalysis = async () => {
    if (!result?.success || !result.data || !isAuthenticated) {
      toast.error("Cannot save analysis - please ensure you're logged in");
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
      };

      await saveTikTokAnalysis(saveData);

      setIsSaved(true);
      toast.success("Analysis saved successfully!");
    } catch (error) {
      console.error("Failed to save analysis:", error);
      toast.error("Failed to save analysis. Please try again.");
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
    <section className="py-24 md:py-32">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Fact Checking
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Verify Content with{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Checkmate
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Combat misinformation with our AI-powered fact-checking tool. Paste
          any TikTok/Twitter(X) link to get instant transcription, news
          detection, and credibility reports with verified sources.
        </p>
        <div className="mx-auto max-w-2xl space-y-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 items-center justify-center"
          >
            <Input
              placeholder="Paste TikTok/Twitter(X) link here..."
              className="flex-1 h-12 text-base min-w-0"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              className="px-6 h-12 shrink-0"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center">
            Try it with any TikTok/Twitter(X) video URL to see the magic happen
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="mx-auto max-w-4xl mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {result.success ? "Analysis Complete" : "Analysis Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success && result.data ? (
                  <div className="space-y-6 text-left">
                    {/* Video Metadata */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {result.data.metadata.title}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Creator: {result.data.metadata.creator}</p>
                        <p>
                          Platform: {result.data.metadata.platform || "Unknown"}
                        </p>
                        <p>Original URL: {result.data.metadata.originalUrl}</p>
                        {result.data.metadata.description &&
                          result.data.metadata.description !==
                            result.data.metadata.title && (
                            <p>
                              Description: {result.data.metadata.description}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Transcription */}
                    {result.data.transcription &&
                      result.data.transcription.text &&
                      result.data.transcription.text.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Transcription
                          </h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm leading-relaxed">
                              <AnalysisRenderer
                                content={result.data.transcription.text}
                              />
                            </div>
                            {result.data.transcription.language && (
                              <p className="text-xs text-muted-foreground mt-3">
                                Language: {result.data.transcription.language}
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
                            {result.data.metadata.platform === "twitter"
                              ? "Twitter/X"
                              : "TikTok"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Content Type:</span>
                          <Badge variant="outline">
                            {result.data.metadata.platform === "twitter"
                              ? "Social Post"
                              : "Video Content"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Fact-Check Required:</span>
                          <Badge
                            variant={
                              result.data.requiresFactCheck
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {result.data.requiresFactCheck ? "Yes" : "No"}
                          </Badge>
                        </div>
                        {result.data.factCheck && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              Verification Status:
                            </span>
                            <Badge
                              variant={
                                (
                                  result.data
                                    .factCheck as unknown as FactCheckResult
                                ).isVerified
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {(
                                result.data
                                  .factCheck as unknown as FactCheckResult
                              ).isVerified
                                ? "Verified"
                                : "Pending"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* News Detection */}
                    {result.data.newsDetection && (
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
                                result.data.newsDetection.contentType ===
                                "news_factual"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.data.newsDetection.contentType ===
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
                                result.data.requiresFactCheck
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.data.requiresFactCheck ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Confidence:</span>
                            <span className="text-sm font-medium">
                              {Math.round(
                                result.data.newsDetection.confidence * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fact-Check Results */}
                    {result.data.factCheck && (
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4" />
                          Fact-Check Results
                        </h4>

                        {/* Overall Verification Status */}
                        <Card
                          className={`border-l-4 ${
                            (
                              result.data
                                .factCheck as unknown as FactCheckResult
                            ).verdict === "true"
                              ? "border-l-green-500"
                              : (
                                    result.data
                                      .factCheck as unknown as FactCheckResult
                                  ).verdict === "false"
                                ? "border-l-red-500"
                                : (
                                      result.data
                                        .factCheck as unknown as FactCheckResult
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
                                    <AnalysisRenderer
                                      content={
                                        (
                                          result.data
                                            .factCheck as unknown as FactCheckResult
                                        ).content
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {getStatusIcon(
                                    (
                                      result.data
                                        .factCheck as unknown as FactCheckResult
                                    ).verdict
                                  )}
                                  {getStatusBadge(
                                    (
                                      result.data
                                        .factCheck as unknown as FactCheckResult
                                    ).verdict
                                  )}
                                </div>
                              </div>

                              {(
                                result.data
                                  .factCheck as unknown as FactCheckResult
                              ).explanation && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                  <p className="font-medium mb-3 text-base">
                                    Analysis:
                                  </p>
                                  <div>
                                    {(() => {
                                      const explanation = (
                                        result.data
                                          .factCheck as unknown as FactCheckResult
                                      ).explanation;
                                      const shouldTruncate =
                                        explanation.length > 500;

                                      const contentToShow =
                                        shouldTruncate && !isAnalysisExpanded
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
                                      result.data
                                        .factCheck as unknown as FactCheckResult
                                    ).explanation;

                                    if (explanation.length <= 500) return null;

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
                                result.data
                                  .factCheck as unknown as FactCheckResult
                              ).sources &&
                                (
                                  result.data
                                    .factCheck as unknown as FactCheckResult
                                ).sources.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium mb-2">
                                      Sources (
                                      {
                                        (
                                          result.data
                                            .factCheck as unknown as FactCheckResult
                                        ).sources.length
                                      }{" "}
                                      found):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {(
                                        result.data
                                          .factCheck as unknown as FactCheckResult
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
                                      result.data
                                        .factCheck as unknown as FactCheckResult
                                    ).confidence
                                  }
                                  %
                                </span>
                                <span>
                                  Verified:{" "}
                                  {(
                                    result.data
                                      .factCheck as unknown as FactCheckResult
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
                              ? "Saved!"
                              : isSaving
                                ? "Saving..."
                                : "Save Analysis"}
                          </Button>
                        )}

                        <Button variant="outline" onClick={handleReset}>
                          Analyze Another Video
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
                ) : (
                  <div className="text-left">
                    <p className="text-red-500 mb-4">{result.error}</p>
                    <Button variant="outline" onClick={handleReset}>
                      Try Again
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
