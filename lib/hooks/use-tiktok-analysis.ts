import { useState } from "react";

interface TikTokAnalysisData {
  title: string;
  thumbnail: string;
  hasVideo: boolean;
  hasImages: boolean;
  hasAudio: boolean;
  downloadLinks: {
    video: {
      standard?: string;
      alternative?: string;
      hd?: string;
    };
    audio?: string;
    images: string[];
  };
  metadata: {
    creator: string;
    contentType: "image_collection" | "video";
  };
  transcription?: {
    text: string;
    segments: Array<{
      text: string;
      startSecond: number;
      endSecond: number;
    }>;
    language?: string;
  } | null;
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

      // Call the API route
      const response = await fetch("/api/analyze-tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze TikTok video");
      }

      const analysis: TikTokAnalysisResult = await response.json();
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
