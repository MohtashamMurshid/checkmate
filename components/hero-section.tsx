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
} from "lucide-react";
import { useTikTokAnalysis } from "@/lib/hooks/use-tiktok-analysis";
import { toast } from "sonner";

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

// Component to render markdown-like analysis content in a structured way
function AnalysisRenderer({ content }: { content: string }) {
  const renderContent = (text: string) => {
    const sections = text.split(/\*\*([^*]+):\*\*/);
    const result = [];

    for (let i = 0; i < sections.length; i++) {
      if (i === 0 && sections[i].trim()) {
        // First section (before any headers)
        result.push(
          <div key={i} className="prose prose-sm max-w-none">
            {renderText(sections[i].trim())}
          </div>
        );
      } else if (i % 2 === 1) {
        // Header
        const header = sections[i];
        const content = sections[i + 1] || "";

        result.push(
          <div key={i} className="mb-4">
            <h4 className="font-semibold text-base mb-3 text-primary">
              {header}
            </h4>
            <div className="pl-3 border-l-2 border-gray-200">
              {renderSectionContent(content)}
            </div>
          </div>
        );
        i++; // Skip the content part as we've processed it
      }
    }

    return result;
  };

  const renderSectionContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("- **") && line.includes(":**")) {
        // Sub-header with content
        const match = line.match(/- \*\*([^*]+):\*\*(.*)/);
        if (match) {
          elements.push(
            <div key={i} className="mb-3">
              <h5 className="font-medium text-sm mb-1 text-gray-800">
                {match[1]}
              </h5>
              <div className="pl-3">{renderText(match[2])}</div>
            </div>
          );
        }
      } else if (line.startsWith("- ")) {
        // Regular bullet point
        elements.push(
          <div key={i} className="flex items-start gap-2 mb-2">
            <span className="text-primary mt-1 text-xs">•</span>
            <div className="flex-1 text-sm leading-relaxed">
              {renderText(line.substring(2))}
            </div>
          </div>
        );
      } else if (line.trim()) {
        // Regular paragraph
        elements.push(
          <div key={i} className="mb-2 text-sm leading-relaxed">
            {renderText(line)}
          </div>
        );
      }
    }

    return elements;
  };

  const renderText = (text: string) => {
    // Handle links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline font-medium"
        >
          {match[1]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 1 ? parts : text;
  };

  return <div className="space-y-4">{renderContent(content)}</div>;
}

export function HeroSection({ initialUrl = "" }: HeroSectionProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const { analyzeTikTok, isLoading, result, reset } = useTikTokAnalysis();
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
    reset();
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
          <Badge className="bg-gray-100 text-gray-800">Unverifiable</Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800">
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
                        <p>Original URL: {result.data.metadata.originalUrl}</p>
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
                            <p className="text-sm leading-relaxed">
                              &ldquo;{result.data.transcription.text}&rdquo;
                            </p>
                            {result.data.transcription.language && (
                              <p className="text-xs text-muted-foreground mt-3">
                                Language: {result.data.transcription.language}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

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
                                  <p className="text-sm text-muted-foreground">
                                    {
                                      (
                                        result.data
                                          .factCheck as unknown as FactCheckResult
                                      ).content
                                    }
                                  </p>
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
                                <div className="bg-gray-50 p-4 rounded-lg">
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

                    {/* Reset Button */}
                    <div className="pt-4 border-t">
                      <Button variant="outline" onClick={handleReset}>
                        Analyze Another Video
                      </Button>
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
