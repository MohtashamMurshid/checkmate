import { Downloader } from "@tobyg74/tiktok-api-dl";
import {
  BaseHandler,
  ProcessingContext,
  ExtractedContent,
  TranscriptionResult,
  FactCheckResult,
} from "./base-handler";
import { ApiError } from "../../../../lib/api-error";
import { transcribeVideoDirectly } from "../../../../tools/index";
import { researchAndFactCheck } from "../../../../tools/fact-checking";
import { calculateCreatorCredibilityRating } from "../../../../tools/content-analysis";
import { logger } from "../../../../lib/logger";

/**
 * TikTok-specific data extracted from the platform
 */
interface TikTokExtractedData extends ExtractedContent {
  videoUrl?: string;
  videoHD?: string;
  videoWatermark?: string;
  type: string;
}

/**
 * TikTok content handler
 *
 * Handles the complete processing pipeline for TikTok videos:
 * 1. Extract video metadata and download URLs
 * 2. Transcribe video audio to text
 * 3. Fact-check the transcribed content
 * 4. Calculate creator credibility rating
 *
 * @example
 * ```typescript
 * const handler = new TikTokHandler();
 * const result = await handler.process(tiktokUrl, context);
 * ```
 */
export class TikTokHandler extends BaseHandler {
  constructor() {
    super("tiktok");
  }

  /**
   * Extract TikTok video metadata and download URLs
   * @param url - TikTok video URL
   * @param context - Processing context
   * @returns Extracted TikTok data
   * @throws ApiError if extraction fails
   */
  protected async extractContent(
    url: string,
    context: ProcessingContext
  ): Promise<ExtractedContent | null> {
    logger.debug("Extracting TikTok content", {
      requestId: context.requestId,
      platform: this.platform,
      operation: "extract-content",
      metadata: { url },
    });

    try {
      const result = await Downloader(url, { version: "v3" });

      if (result.status !== "success" || !result.result) {
        throw ApiError.tiktokFetchFailed(
          url,
          new Error("TikTok downloader returned unsuccessful status")
        );
      }

      const data = result.result;

      const extractedData: TikTokExtractedData = {
        title: data.desc || "TikTok Video",
        description: data.desc || "",
        creator: data.author?.nickname || "Unknown",
        videoUrl: data.videoSD || undefined,
        videoHD: data.videoHD || undefined,
        videoWatermark: data.videoWatermark || undefined,
        type: data.type || "video",
      };

      return extractedData;
    } catch (error) {
      logger.error(
        "TikTok content extraction failed",
        {
          requestId: context.requestId,
          platform: this.platform,
          operation: "extract-content",
          metadata: { url },
        },
        error as Error
      );

      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.tiktokFetchFailed(url, error as Error);
    }
  }

  /**
   * Transcribe TikTok video audio to text
   * @param extractedData - Data extracted from TikTok
   * @param context - Processing context
   * @returns Transcription result or null if no video or transcription fails
   */
  protected async transcribeContent(
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<TranscriptionResult | null> {
    if (!extractedData) {
      return null;
    }

    const tiktokData = extractedData as TikTokExtractedData;
    const videoUrl =
      tiktokData.videoHD || tiktokData.videoWatermark || tiktokData.videoUrl;

    if (!videoUrl || tiktokData.type !== "video") {
      logger.debug("No video URL available for transcription", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "transcribe-content",
        metadata: {
          hasVideoUrl: !!videoUrl,
          contentType: tiktokData.type,
        },
      });
      return null;
    }

    try {
      logger.debug("Starting video transcription", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "transcribe-content",
        metadata: { videoUrl },
      });

      const transcriptionResult = await transcribeVideoDirectly(videoUrl);

      if (transcriptionResult.success && transcriptionResult.data) {
        logger.info("Video transcription completed", {
          requestId: context.requestId,
          platform: this.platform,
          operation: "transcribe-content",
          metadata: {
            textLength: transcriptionResult.data.text?.length || 0,
            language: transcriptionResult.data.language,
          },
        });

        // Transform the transcription result to match our interface
        interface TranscriptionSegment {
          startSecond: number;
          endSecond: number;
          text: string;
        }

        const transformed: TranscriptionResult = {
          text: transcriptionResult.data.text,
          segments:
            transcriptionResult.data.segments?.map(
              (segment: TranscriptionSegment) => ({
                start: segment.startSecond || 0,
                end: segment.endSecond || 0,
                text: segment.text,
              })
            ) || [],
          language: transcriptionResult.data.language,
        };

        return transformed;
      }

      logger.warn("Video transcription returned no data", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "transcribe-content",
        metadata: { success: transcriptionResult.success },
      });

      return null;
    } catch (error) {
      logger.warn(
        `Video transcription failed, continuing without transcription: ${error}`,
        {
          requestId: context.requestId,
          platform: this.platform,
          operation: "transcribe-content",
        }
      );

      // Don't throw error for transcription failures - continue without it
      return null;
    }
  }

  /**
   * Fact-check the video content using transcription and description
   * @param transcription - Transcribed text from video
   * @param extractedData - Original TikTok data
   * @param context - Processing context
   * @returns Fact-check result or null if no content to check
   */
  protected async performFactCheck(
    transcription: TranscriptionResult | null,
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<FactCheckResult | null> {
    if (!extractedData) {
      return null;
    }

    const tiktokData = extractedData as TikTokExtractedData;
    const textToFactCheck = transcription?.text || tiktokData.description;

    if (!textToFactCheck || textToFactCheck.trim().length === 0) {
      logger.debug("No content available for fact-checking", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "fact-check",
        metadata: {
          hasTranscription: !!transcription?.text,
          hasDescription: !!tiktokData.description,
        },
      });
      return null;
    }

    try {
      logger.debug("Starting fact-check process", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "fact-check",
        metadata: {
          contentLength: textToFactCheck.length,
          creator: tiktokData.creator,
        },
      });

      const contextPrompt = `TikTok Content Analysis Context:
- Creator: ${tiktokData.creator}
- Video Content: "${tiktokData.description}"
- Video URL: ${context.url}
- Platform: TikTok

${transcription ? `Transcribed Content: "${transcription.text}"` : ""}

Please fact-check the claims from this TikTok video content, paying special attention to both the video text${transcription ? " and the transcribed speech" : ""}. Consider the context that this is social media content that may contain opinions, personal experiences, or claims that need verification.`;

      const factCheck = await researchAndFactCheck.execute(
        {
          transcription: textToFactCheck,
          title: tiktokData.description,
          context: contextPrompt,
        },
        {
          toolCallId: "tiktok-verification",
          messages: [],
        }
      );

      if (factCheck.success && factCheck.data) {
        interface FactCheckData {
          overallStatus?: string;
          confidence?: number;
          reasoning?: string;
          sources?: Array<{ url: string; title: string; credibility: number }>;
          webSearchAnalysis?: { summary?: string };
        }

        const resultData = factCheck.data as FactCheckData;

        const factCheckResult: FactCheckResult = {
          verdict:
            (resultData.overallStatus as FactCheckResult["verdict"]) ||
            "unverified",
          confidence: Math.round((resultData.confidence || 0.5) * 100),
          explanation: resultData.reasoning || "No analysis available",
          content:
            textToFactCheck.substring(0, 500) +
            (textToFactCheck.length > 500 ? "..." : ""),
          sources: resultData.sources || [],
          flags: [],
        };

        logger.info("Fact-check completed", {
          requestId: context.requestId,
          platform: this.platform,
          operation: "fact-check",
          metadata: {
            verdict: factCheckResult.verdict,
            confidence: factCheckResult.confidence,
            sourcesCount: factCheckResult.sources.length,
          },
        });

        return factCheckResult;
      }

      logger.warn("Fact-check service returned unsuccessful result", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "fact-check",
        metadata: { success: factCheck.success },
      });

      // Return fallback result
      return {
        verdict: "unverified",
        confidence: 0,
        explanation:
          "Verification service temporarily unavailable. Manual fact-checking recommended.",
        content:
          textToFactCheck.substring(0, 500) +
          (textToFactCheck.length > 500 ? "..." : ""),
        sources: [],
        flags: ["service_unavailable"],
      };
    } catch (error) {
      logger.error(
        "Fact-check process failed",
        {
          requestId: context.requestId,
          platform: this.platform,
          operation: "fact-check",
        },
        error as Error
      );

      // Return fallback instead of throwing
      return {
        verdict: "unverified",
        confidence: 0,
        explanation:
          "Fact-checking failed due to technical error. Manual verification recommended.",
        content:
          textToFactCheck.substring(0, 500) +
          (textToFactCheck.length > 500 ? "..." : ""),
        sources: [],
        flags: ["technical_error"],
      };
    }
  }

  /**
   * Calculate creator credibility rating based on fact-check results
   * @param factCheck - Fact-check results
   * @param extractedData - Original TikTok data
   * @param context - Processing context
   * @returns Credibility rating (0-10) or null if calculation fails
   */
  protected async calculateCredibility(
    factCheck: FactCheckResult | null,
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<number | null> {
    if (!factCheck || !extractedData) {
      logger.debug(
        "Skipping credibility calculation - no verified fact-check data",
        {
          requestId: context.requestId,
          platform: this.platform,
          operation: "calculate-credibility",
          metadata: {
            hasFactCheck: !!factCheck,
            hasExtractedData: !!extractedData,
          },
        }
      );
      return null;
    }

    const tiktokData = extractedData as TikTokExtractedData;

    try {
      logger.debug("Calculating creator credibility", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
        metadata: {
          creator: tiktokData.creator,
          factCheckVerdict: factCheck.verdict,
        },
      });

      const credibilityResult = await calculateCreatorCredibilityRating.execute(
        {
          factCheckResult: {
            verdict: factCheck.verdict,
            confidence: factCheck.confidence,
            isVerified: true,
          },
          contentMetadata: {
            creator: tiktokData.creator || "Unknown",
            platform: this.platform,
            title: tiktokData.description || "",
            hasTranscription: true, // TikTok always has some form of content
            contentType: tiktokData.type,
          },
          analysisMetrics: {
            hasNewsContent: true,
            needsFactCheck: true,
            contentLength: tiktokData.description?.length || 0,
          },
        },
        {
          toolCallId: "tiktok-credibility-rating",
          messages: [],
        }
      );

      if (credibilityResult.success && credibilityResult.data) {
        const rating = credibilityResult.data.credibilityRating;

        logger.info("Creator credibility calculated", {
          requestId: context.requestId,
          platform: this.platform,
          operation: "calculate-credibility",
          metadata: {
            creator: tiktokData.creator,
            rating,
          },
        });

        return rating;
      }

      logger.warn("Credibility calculation returned unsuccessful result", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
        metadata: { success: credibilityResult.success },
      });

      return null;
    } catch (error) {
      logger.warn(`Creator credibility calculation failed: ${error}`, {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
      });

      return null;
    }
  }
}
