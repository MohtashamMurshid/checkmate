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
 *
 * Extends the base ExtractedContent interface with TikTok-specific metadata
 * including video download URLs in different qualities and content type information.
 *
 * @interface TikTokExtractedData
 * @extends ExtractedContent
 * @since 1.0.0
 */
interface TikTokExtractedData extends ExtractedContent {
  /** Standard definition video download URL */
  videoUrl?: string;
  /** High definition video download URL (preferred for transcription) */
  videoHD?: string;
  /** Video URL with TikTok watermark */
  videoWatermark?: string;
  /** Content type (e.g., 'video', 'image', 'live') */
  type: string;
}

/**
 * TikTok content handler implementation
 *
 * Specialized handler for processing TikTok videos through a comprehensive analysis pipeline.
 * This handler orchestrates the complete workflow from video extraction to credibility assessment.
 *
 * ## Processing Pipeline
 * 1. **Content Extraction**: Downloads video metadata and obtains video URLs
 * 2. **Audio Transcription**: Converts video audio to text using speech-to-text services
 * 3. **Fact Verification**: Analyzes claims in transcribed content and video descriptions
 * 4. **Credibility Assessment**: Calculates creator trustworthiness based on content analysis
 *
 * ## Supported Content Types
 * - Standard TikTok videos with audio
 * - Videos with text overlays and descriptions
 * - Multi-language content (automatic language detection)
 *
 * ## Error Handling
 * The handler implements graceful degradation:
 * - If transcription fails, continues with description analysis
 * - If fact-checking fails, returns fallback results
 * - If credibility calculation fails, returns null rating
 *
 * @class TikTokHandler
 * @extends BaseHandler
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const handler = new TikTokHandler();
 * const context = {
 *   requestId: 'req-123',
 *   url: 'https://www.tiktok.com/@user/video/1234567890',
 *   timeout: 30000
 * };
 *
 * try {
 *   const result = await handler.process(tiktokUrl, context);
 *   console.log('Analysis complete:', result);
 * } catch (error) {
 *   console.error('Processing failed:', error);
 * }
 * ```
 */
export class TikTokHandler extends BaseHandler {
  /**
   * Creates a new TikTok handler instance
   *
   * Initializes the handler with platform-specific configuration for TikTok content processing.
   *
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    super("tiktok");
  }

  /**
   * Extracts TikTok video metadata and download URLs
   *
   * Uses the TikTok API downloader to fetch comprehensive video metadata including
   * multiple quality video URLs, creator information, and content descriptions.
   * This method prioritizes HD video URLs for better transcription quality.
   *
   * @protected
   * @async
   * @method extractContent
   * @param {string} url - The TikTok video URL to process (must be a valid TikTok video link)
   * @param {ProcessingContext} context - Processing context containing request ID and configuration
   * @param {string} context.requestId - Unique identifier for tracking this request
   * @param {number} [context.timeout] - Optional timeout in milliseconds
   *
   * @returns {Promise<ExtractedContent | null>} Promise resolving to extracted TikTok data or null if extraction fails
   * @returns {TikTokExtractedData} Returns TikTok-specific data including:
   *   - Video URLs in multiple qualities (SD, HD, watermarked)
   *   - Creator nickname and metadata
   *   - Video description and title
   *   - Content type classification
   *
   * @throws {ApiError} Throws TikTok-specific API error if:
   *   - URL is invalid or inaccessible
   *   - TikTok API returns error status
   *   - Network request fails
   *   - Video is private or deleted
   *
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * const extracted = await handler.extractContent(
   *   'https://www.tiktok.com/@user/video/1234567890',
   *   { requestId: 'req-123' }
   * );
   *
   * if (extracted) {
   *   console.log('Creator:', extracted.creator);
   *   console.log('Video URL:', extracted.videoHD || extracted.videoUrl);
   * }
   * ```
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
   * Transcribes TikTok video audio to text using speech-to-text services
   *
   * Attempts to extract and transcribe audio from TikTok videos, prioritizing
   * higher quality video sources for better transcription accuracy. Supports
   * automatic language detection and returns timestamped segments.
   *
   * The method implements a quality fallback strategy:
   * 1. First tries HD video URL
   * 2. Falls back to watermarked video
   * 3. Finally uses standard definition video
   *
   * @protected
   * @async
   * @method transcribeContent
   * @param {ExtractedContent | null} extractedData - Previously extracted TikTok data
   * @param {ProcessingContext} context - Processing context for logging and tracking
   * @param {string} context.requestId - Unique request identifier
   *
   * @returns {Promise<TranscriptionResult | null>} Promise resolving to transcription data or null
   * @returns {TranscriptionResult} Returns transcription containing:
   *   - Full transcribed text
   *   - Timestamped segments with start/end times
   *   - Detected language code
   * @returns {null} Returns null if:
   *   - No extracted data available
   *   - No video URL found
   *   - Content type is not video
   *   - Transcription service fails
   *
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * const transcription = await handler.transcribeContent(extractedData, context);
   *
   * if (transcription) {
   *   console.log('Transcribed text:', transcription.text);
   *   console.log('Language:', transcription.language);
   *   console.log('Segments:', transcription.segments.length);
   * }
   * ```
   *
   * @see {@link transcribeVideoDirectly} for the underlying transcription service
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
   * Performs comprehensive fact-checking on TikTok video content
   *
   * Analyzes claims and statements in both transcribed audio and video descriptions
   * using advanced fact-checking algorithms. The method prioritizes transcribed
   * content over descriptions for accuracy, but falls back gracefully when
   * transcription is unavailable.
   *
   * ## Analysis Process
   * 1. **Content Prioritization**: Uses transcribed text if available, otherwise video description
   * 2. **Context Assembly**: Builds comprehensive analysis prompt with creator and platform context
   * 3. **Claim Verification**: Researches factual claims against reliable sources
   * 4. **Confidence Scoring**: Assigns confidence levels based on source reliability
   * 5. **Source Attribution**: Provides verifiable sources for fact-check results
   *
   * @protected
   * @async
   * @method performFactCheck
   * @param {TranscriptionResult | null} transcription - Transcribed audio content from the video
   * @param {ExtractedContent | null} extractedData - Original TikTok metadata and descriptions
   * @param {ProcessingContext} context - Processing context with request tracking
   * @param {string} context.requestId - Unique identifier for this analysis request
   * @param {string} context.url - Original TikTok URL being analyzed
   *
   * @returns {Promise<FactCheckResult | null>} Promise resolving to fact-check analysis or null
   * @returns {FactCheckResult} Returns comprehensive fact-check containing:
   *   - Overall verdict (verified, false, misleading, unverified)
   *   - Confidence percentage (0-100)
   *   - Detailed explanation of findings
   *   - Analyzed content snippet
   *   - Credible sources with reliability scores
   *   - Warning flags for potential issues
   * @returns {null} Returns null if no content is available for analysis
   *
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * const factCheck = await handler.performFactCheck(
   *   transcription,
   *   extractedData,
   *   context
   * );
   *
   * if (factCheck) {
   *   console.log('Verdict:', factCheck.verdict);
   *   console.log('Confidence:', factCheck.confidence + '%');
   *   console.log('Sources:', factCheck.sources.length);
   * }
   * ```
   *
   * @see {@link researchAndFactCheck} for the underlying fact-checking service
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
   * Calculates creator credibility rating based on comprehensive content analysis
   *
   * Evaluates the trustworthiness and reliability of the TikTok creator based on
   * fact-check results, content quality metrics, and platform-specific factors.
   * The rating system considers historical accuracy, source reliability, and
   * content verification patterns.
   *
   * ## Rating Factors
   * - **Fact-check Results**: Accuracy and confidence of current content verification
   * - **Content Quality**: Presence of transcription, description detail, content type
   * - **Platform Context**: TikTok-specific credibility indicators
   * - **Creator Metadata**: Username, verification status, content patterns
   *
   * ## Rating Scale
   * - **9-10**: Highly credible, verified information from reliable sources
   * - **7-8**: Generally credible with minor concerns or unverified claims
   * - **5-6**: Mixed credibility, some verified and some questionable content
   * - **3-4**: Low credibility, significant misinformation or unverified claims
   * - **1-2**: Very low credibility, primarily false or misleading content
   * - **0**: No credible information, completely unreliable
   *
   * @protected
   * @async
   * @method calculateCredibility
   * @param {FactCheckResult | null} factCheck - Results from content fact-checking analysis
   * @param {ExtractedContent | null} extractedData - Original TikTok content metadata
   * @param {ProcessingContext} context - Processing context for logging and tracking
   * @param {string} context.requestId - Unique identifier for this credibility calculation
   *
   * @returns {Promise<number | null>} Promise resolving to credibility rating or null
   * @returns {number} Credibility rating from 0-10 where:
   *   - Higher scores indicate more credible creators
   *   - Scores are based on content verification and quality metrics
   *   - Ratings are rounded to nearest integer for consistency
   * @returns {null} Returns null if:
   *   - No fact-check data available
   *   - No extracted content metadata
   *   - Credibility calculation service fails
   *   - Insufficient data for meaningful assessment
   *
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * const credibility = await handler.calculateCredibility(
   *   factCheckResult,
   *   extractedData,
   *   context
   * );
   *
   * if (credibility !== null) {
   *   console.log(`Creator credibility: ${credibility}/10`);
   *
   *   if (credibility >= 7) {
   *     console.log('High credibility creator');
   *   } else if (credibility >= 5) {
   *     console.log('Moderate credibility creator');
   *   } else {
   *     console.log('Low credibility creator');
   *   }
   * }
   * ```
   *
   * @see {@link calculateCreatorCredibilityRating} for the underlying rating algorithm
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
