import { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TikTokAnalysisResult | null>(null);

  const analyzeTikTok = async (url: string): Promise<TikTokAnalysisResult> => {
    setIsLoading(true);
    setResult(null);

    try {
      // Validate TikTok URL format
      const tiktokUrlPattern =
        /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      if (!tiktokUrlPattern.test(url)) {
        throw new Error("Invalid TikTok URL format");
      }

      // Call the transcribe API route
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tiktokUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze TikTok video");
      }

      const analysis: TikTokAnalysisResult = await response.json();
      console.log("🔍 Full API Response:", JSON.stringify(analysis, null, 2));
      console.log("📊 Analysis Data:", analysis.data);
      if (analysis.data?.factCheck) {
        console.log("✅ Fact-Check Results:", analysis.data.factCheck);
        console.log("📋 Individual Claims:", analysis.data.factCheck.results);
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
    result,
    reset,
  };
}
