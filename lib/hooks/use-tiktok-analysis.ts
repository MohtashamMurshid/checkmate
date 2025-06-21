import { useState } from "react";
import {
  useSaveTikTokAnalysis,
  useSaveTikTokAnalysisWithCredibility,
} from "./use-saved-analyses";
import { useConvexAuth } from "convex/react";

interface TranscriptionData {
  text: string;
  segments: Array<{
    text: string;
    startSecond: number;
    endSecond: number;
  }>;
  language?: string;
}

interface NewsDetection {
  hasNewsContent: boolean;
  confidence: number;
  newsKeywordsFound: string[];
  potentialClaims: string[];
  needsFactCheck: boolean;
  contentType: string;
}

interface FactCheckSource {
  title: string;
  url: string;
  source: string;
  relevance: number;
  description?: string;
}

interface FactCheckResult {
  claim: string;
  status: string;
  confidence: number;
  analysis?: string;
  sources?: FactCheckSource[];
  error?: string;
}

interface FactCheckData {
  totalClaims: number;
  checkedClaims: number;
  results: FactCheckResult[];
  summary: {
    verifiedTrue: number;
    verifiedFalse: number;
    misleading: number;
    unverifiable: number;
    needsVerification: number;
  };
  sources?: FactCheckSource[];
}

interface TikTokAnalysisData {
  transcription: TranscriptionData;
  metadata: {
    title: string;
    description: string;
    creator: string;
    originalUrl: string;
    platform?: string;
  };
  newsDetection: NewsDetection | null;
  factCheck: FactCheckData | null;
  requiresFactCheck: boolean;
  creatorCredibilityRating?: number;
}

interface TikTokAnalysisResult {
  success: boolean;
  data?: TikTokAnalysisData;
  error?: string;
}

export function useTikTokAnalysis() {
  const { isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TikTokAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTikTokAnalysis = useSaveTikTokAnalysis();
  const saveTikTokAnalysisWithCredibility =
    useSaveTikTokAnalysisWithCredibility();

  const analyzeTikTok = async (
    url: string,
    saveToDb = false // Changed default to false to prevent auto-save duplicates
  ): Promise<TikTokAnalysisResult> => {
    setIsLoading(true);
    setResult(null);

    try {
      // Validate URL format (TikTok, Twitter, or general web URL)
      const tiktokUrlPattern =
        /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      const twitterUrlPattern =
        /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;

      // Basic URL validation for any other web content
      try {
        new URL(url);
      } catch {
        throw new Error("Invalid URL format. Please provide a valid URL.");
      }

      // Determine platform and set appropriate body parameter
      const isTikTok = tiktokUrlPattern.test(url);
      const isTwitter = twitterUrlPattern.test(url);

      const requestBody: {
        tiktokUrl?: string;
        twitterUrl?: string;
        webUrl?: string;
      } = {};
      if (isTikTok) {
        requestBody.tiktokUrl = url;
      } else if (isTwitter) {
        requestBody.twitterUrl = url;
      } else {
        requestBody.webUrl = url;
      }

      // Call the transcribe API route
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to analyze ${isTikTok ? "TikTok" : isTwitter ? "Twitter" : "web"} content`
        );
      }

      // const analysis: TikTokAnalysisResult = await response.json();
      const analysis: TikTokAnalysisResult = await response.json();
      // Removed console.log statements for API response and analysis data
      // Removed console.log statements for newsDetection, factCheck, and summary
      // Removed console.log for no fact-check results

      // Auto-save is disabled by default to prevent duplicates
      // The user can manually save from the UI if needed
      if (saveToDb && isAuthenticated && analysis.success && analysis.data) {
        try {
          setIsSaving(true);

          // Use enhanced save function if credibility rating is available
          if (analysis.data.creatorCredibilityRating !== undefined) {
            await saveTikTokAnalysisWithCredibility({
              videoUrl: analysis.data.metadata.originalUrl,
              transcription: {
                text: analysis.data.transcription.text,
                duration: undefined, // API doesn't return duration yet
                language: analysis.data.transcription.language,
              },
              metadata: analysis.data.metadata,
              newsDetection: analysis.data.newsDetection || undefined,
              factCheck: analysis.data.factCheck
                ? {
                    ...analysis.data.factCheck,
                    sources: analysis.data.factCheck.sources?.map((s) => ({
                      title: s.title,
                      url: s.url,
                      source: s.source,
                      relevance: s.relevance,
                    })),
                    results: (analysis.data.factCheck.results || []).map(
                      (result) => ({
                        claim: result.claim,
                        status: result.status,
                        confidence: result.confidence,
                        analysis: result.analysis,
                        sources: result.sources?.map((s) => s.url) || [],
                        error: result.error,
                      })
                    ),
                  }
                : undefined,
              requiresFactCheck: analysis.data.requiresFactCheck,
              creatorCredibilityRating: analysis.data.creatorCredibilityRating,
            });
          } else {
            // Fallback to regular save if no credibility rating
            await saveTikTokAnalysis({
              videoUrl: analysis.data.metadata.originalUrl,
              transcription: {
                text: analysis.data.transcription.text,
                duration: undefined, // API doesn't return duration yet
                language: analysis.data.transcription.language,
              },
              metadata: analysis.data.metadata,
              newsDetection: analysis.data.newsDetection || undefined,
              factCheck: analysis.data.factCheck
                ? {
                    ...analysis.data.factCheck,
                    sources: analysis.data.factCheck.sources?.map((s) => ({
                      title: s.title,
                      url: s.url,
                      source: s.source,
                      relevance: s.relevance,
                    })),
                    results: (analysis.data.factCheck.results || []).map(
                      (result) => ({
                        claim: result.claim,
                        status: result.status,
                        confidence: result.confidence,
                        analysis: result.analysis,
                        sources: result.sources?.map((s) => s.url) || [],
                        error: result.error,
                      })
                    ),
                  }
                : undefined,
              requiresFactCheck: analysis.data.requiresFactCheck,
            });
          }
        } catch (saveError) {
          console.error("Failed to save analysis to database:", saveError);
          console.error(
            "Save error details:",
            JSON.stringify(saveError, null, 2)
          );
          // Don't fail the entire operation if saving fails
        } finally {
          setIsSaving(false);
        }
      }

      setResult(analysis);
      return analysis;
    } catch (error) {
      const errorResult = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsLoading(false);
  };

  return {
    analyzeTikTok,
    isLoading,
    isSaving,
    result,
    reset,
  };
}
