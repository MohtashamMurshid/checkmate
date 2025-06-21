"use client";

import { useState } from "react";
import { useTikTokAnalysisById } from "@/lib/hooks/use-saved-analyses";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  ClipboardCheck,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalysisRenderer } from "@/components/analysis-renderer";
import { CreatorCredibilityDisplay } from "@/components/creator-credibility-display";
import { useLanguage } from "@/components/language-provider";

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

export function AnalysisPage({
  analysisId,
}: {
  analysisId: Id<"tiktokAnalyses">;
}) {
  const { t } = useLanguage();
  const analysis = useTikTokAnalysisById(analysisId);
  const [expandedClaims, setExpandedClaims] = useState<Record<number, boolean>>(
    {}
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (analysis === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold">{t.loadingAnalysis}</h1>
          <p className="text-muted-foreground">{t.pleaseWait}</p>
        </div>
      </div>
    );
  }

  if (analysis === null) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <h1 className="text-2xl font-semibold text-red-500 mb-4">
            {t.analysisNotFound}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t.analysisNotFoundMessage}
          </p>
          <Button asChild>
            <Link href="/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToNews}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/news">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToAllAnalyses}
        </Link>
      </Button>

      <div className="space-y-6 text-left">
        {/* Video Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {analysis.metadata?.title || t.analysis}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {analysis.metadata?.creator || t.unknownCreator}
              </span>
              {analysis.metadata?.platform && (
                <Badge variant="secondary" className="text-xs">
                  {analysis.metadata.platform === "twitter"
                    ? "Twitter/X"
                    : "TikTok"}
                </Badge>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(analysis._creationTime)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.metadata?.description &&
              analysis.metadata.description !== analysis.metadata.title && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <strong>{t.description}:</strong>{" "}
                  {analysis.metadata.description}
                </div>
              )}

            {/* Creator Credibility Rating */}
            {analysis.metadata?.creator && analysis.metadata?.platform && (
              <div className="mb-4">
                <CreatorCredibilityDisplay
                  creatorId={analysis.metadata.creator}
                  platform={analysis.metadata.platform}
                  showDetails={false}
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <a
                href={analysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                {t.viewOriginalVideo} <ExternalLink className="h-3 w-3" />
              </a>

              {analysis.metadata?.creator && analysis.metadata?.platform && (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/creator/${encodeURIComponent(analysis.metadata.creator)}?platform=${analysis.metadata.platform}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t.viewAuthor}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcription */}
        {analysis.transcription &&
          analysis.transcription.text &&
          analysis.transcription.text.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-lg">
                <ShieldCheckIcon className="h-5 w-5" />
                {t.transcription}
              </h4>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm leading-relaxed">
                  <AnalysisRenderer content={analysis.transcription.text} />
                </div>
                {analysis.transcription.language && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {t.language}: {analysis.transcription.language}
                  </p>
                )}
              </div>
            </div>
          )}

        {/* News Detection */}
        {analysis.newsDetection && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-lg">
              <AlertCircleIcon className="h-5 w-5" />
              {t.contentAnalysis}
            </h4>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.contentType}:</span>
                <Badge
                  variant={
                    analysis.newsDetection.contentType === "news_factual"
                      ? "destructive"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {analysis.newsDetection.contentType.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.requiresFactCheck}:</span>
                <Badge
                  variant={
                    analysis.requiresFactCheck ? "destructive" : "secondary"
                  }
                >
                  {analysis.requiresFactCheck ? t.yes : t.no}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.confidence}:</span>
                <span className="text-sm font-medium">
                  {Math.round(analysis.newsDetection.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fact-Check Results */}
        {analysis.factCheck && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5" />
              {t.factCheckResults}
            </h4>

            {/* New format with verdict, explanation, etc. */}
            {analysis.factCheck.verdict && (
              <Card
                className={`border-l-4 ${
                  analysis.factCheck.verdict === "true"
                    ? "border-l-green-500"
                    : analysis.factCheck.verdict === "false"
                      ? "border-l-red-500"
                      : analysis.factCheck.verdict === "misleading"
                        ? "border-l-yellow-500"
                        : "border-l-gray-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-base mb-2">
                          {t.overallVerificationStatus}
                        </h5>
                        {analysis.factCheck.content && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <AnalysisRenderer
                              content={analysis.factCheck.content}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusIcon(analysis.factCheck.verdict)}
                        {getStatusBadge(analysis.factCheck.verdict)}
                      </div>
                    </div>

                    {analysis.factCheck.explanation && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium mb-3 text-base">
                          {t.analysis}:
                        </p>
                        <div>
                          <AnalysisRenderer
                            content={analysis.factCheck.explanation}
                          />
                        </div>
                      </div>
                    )}

                    {analysis.factCheck.sources &&
                      analysis.factCheck.sources.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2">
                            {t.sources} ({analysis.factCheck.sources.length}{" "}
                            {t.sourcesFound}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.factCheck.sources
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
                                    {source.source ||
                                      new URL(source.url).hostname}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {analysis.factCheck.confidence && (
                        <span>
                          {t.confidence}: {analysis.factCheck.confidence}%
                        </span>
                      )}
                      {analysis.factCheck.isVerified !== undefined && (
                        <span>
                          {t.verified}:{" "}
                          {analysis.factCheck.isVerified ? t.yes : t.no}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legacy format with results array */}
            {analysis.factCheck.results &&
              analysis.factCheck.results.length > 0 &&
              analysis.factCheck.results.map((result, index) => {
                const isExpanded = expandedClaims[index] || false;
                const analysisText = result.analysis || "";
                const shouldTruncate = analysisText.length > 300;

                return (
                  <Card
                    key={index}
                    className={`border-l-4 ${
                      result.status === "true"
                        ? "border-l-green-500"
                        : result.status === "false"
                          ? "border-l-red-500"
                          : result.status === "misleading"
                            ? "border-l-yellow-500"
                            : "border-l-gray-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-base mb-2">
                              {t.claim}
                            </h5>
                            <div className="text-sm text-muted-foreground mb-2">
                              <AnalysisRenderer content={result.claim} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusIcon(result.status)}
                            {getStatusBadge(result.status)}
                          </div>
                        </div>

                        {analysisText && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="font-medium mb-3 text-base">
                              {t.analysis}:
                            </p>
                            <div>
                              <AnalysisRenderer
                                content={
                                  shouldTruncate && !isExpanded
                                    ? analysisText.substring(0, 300) + "..."
                                    : analysisText
                                }
                              />
                            </div>
                            {shouldTruncate && (
                              <button
                                onClick={() =>
                                  setExpandedClaims((prev) => ({
                                    ...prev,
                                    [index]: !isExpanded,
                                  }))
                                }
                                className="mt-4 text-primary hover:text-primary/80 font-medium transition-colors text-sm flex items-center gap-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUpIcon className="h-4 w-4" />
                                    {t.showLess}
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="h-4 w-4" />
                                    {t.showMore}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {result.sources && result.sources.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">
                              {t.sources} ({result.sources.length}{" "}
                              {t.sourcesFound}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.sources
                                .slice(0, 5)
                                .map((sourceUrl, sourceIndex) => (
                                  <Button
                                    key={sourceIndex}
                                    size="sm"
                                    variant="outline"
                                    asChild
                                  >
                                    <a
                                      href={sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs"
                                    >
                                      {new URL(sourceUrl).hostname}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </Button>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {t.confidence}:{" "}
                            {Math.round(result.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
