import { useState } from "react";
import { useSaveTikTokAnalysis } from "./use-saved-analyses";
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
}

interface TikTokAnalysisData {
  transcription: TranscriptionData;
  metadata: {
    title: string;
    description: string;
    creator: string;
    originalUrl: string;
  };
  newsDetection: NewsDetection | null;
  factCheck: FactCheckData | null;
  requiresFactCheck: boolean;
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

  const analyzeTikTok = async (
    url: string,
    saveToDb = true
  ): Promise<TikTokAnalysisResult> => {
    setIsLoading(true);
    setResult(null);

    try {
      // Validate social media URL format (TikTok or Twitter)
      const tiktokUrlPattern =
        /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      const twitterUrlPattern =
        /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;

      if (!tiktokUrlPattern.test(url) && !twitterUrlPattern.test(url)) {
        throw new Error(
          "Invalid social media URL format. Please provide a TikTok or Twitter/X URL."
        );
      }

      // Determine platform and set appropriate body parameter
      const isTikTok = tiktokUrlPattern.test(url);
      const isTwitter = twitterUrlPattern.test(url);

      const requestBody: { tiktokUrl?: string; twitterUrl?: string } = {};
      if (isTikTok) {
        requestBody.tiktokUrl = url;
      } else if (isTwitter) {
        requestBody.twitterUrl = url;
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
            `Failed to analyze ${isTikTok ? "TikTok" : "Twitter"} content`
        );
      }

      const analysis: TikTokAnalysisResult = await response.json();
      console.log("🔍 Full API Response:", JSON.stringify(analysis, null, 2));
      console.log("📊 Analysis Data:", analysis.data);
      if (analysis.data?.newsDetection) {
        console.log("📰 News Detection:", analysis.data.newsDetection);
      }
      if (analysis.data?.factCheck) {
        console.log("✅ Fact-Check Results:", analysis.data.factCheck);
        console.log("📋 Individual Claims:", analysis.data.factCheck.results);
        console.log("📊 Summary:", analysis.data.factCheck.summary);
      } else {
        console.log("❌ No fact-check results found in response");
      }

      // Save to database if requested and analysis was successful
      if (saveToDb && isAuthenticated && analysis.success && analysis.data) {
        try {
          setIsSaving(true);
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
                  results: analysis.data.factCheck.results.map((result) => ({
                    claim: result.claim,
                    status: result.status,
                    confidence: result.confidence,
                    analysis: result.analysis,
                    sources: result.sources?.map((s) => s.url) || [],
                    error: result.error,
                  })),
                }
              : undefined,
            requiresFactCheck: analysis.data.requiresFactCheck,
          });
          console.log("✅ Analysis saved to database");
        } catch (saveError) {
          console.warn("Failed to save analysis to database:", saveError);
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
