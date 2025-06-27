import { logger } from "../../../../lib/logger";

/**
 * Transcription result interface
 */
export interface TranscriptionResult {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language?: string;
}

/**
 * Extracted content data interface
 */
export interface ExtractedContent {
  title?: string;
  description?: string;
  creator?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  publishedAt?: string;
  [key: string]: unknown; // Allow additional platform-specific properties
}

/**
 * Fact check result interface
 */
export interface FactCheckResult {
  verdict: "verified" | "misleading" | "false" | "unverified" | "satire";
  confidence: number; // 0-100
  explanation: string;
  content: string; // Summary/content of what was fact-checked
  sources: Array<{
    url: string;
    title: string;
    credibility: number;
  }>;
  flags: string[];
}

/**
 * Base interface for all platform analysis results
 */
export interface BaseAnalysisResult {
  transcription: TranscriptionResult;
  metadata: {
    title: string;
    description: string;
    creator: string;
    originalUrl: string;
    platform: string;
  };
  factCheck: FactCheckResult | null;
  requiresFactCheck: boolean;
  creatorCredibilityRating: number | null;
}

/**
 * Base context for request processing
 */
export interface ProcessingContext {
  requestId: string;
  userId?: string;
  platform: string;
  url: string;
  startTime: number;
}

/**
 * Abstract base handler for platform-specific content processing
 *
 * This class provides common functionality that all platform handlers need:
 * - Logging with context
 * - Error handling
 * - Timeout management
 * - Performance tracking
 */
export abstract class BaseHandler {
  protected readonly platform: string;

  constructor(platform: string) {
    this.platform = platform;
  }

  /**
   * Main entry point for processing content
   * @param url - The URL to process
   * @param context - Processing context with request info
   * @returns Promise<BaseAnalysisResult>
   */
  async process(
    url: string,
    context: ProcessingContext
  ): Promise<BaseAnalysisResult> {
    const startTime = Date.now();

    logger.info(`Starting ${this.platform} analysis`, {
      requestId: context.requestId,
      platform: this.platform,
      operation: "process",
      metadata: { url },
    });

    try {
      // Step 1: Extract content from platform
      const extractedData = await this.measureOperation(
        "content-extraction",
        () => this.extractContent(url, context),
        context
      );

      // Step 2: Transcribe if there's video content
      const transcription = await this.measureOperation(
        "transcription",
        () => this.transcribeContent(extractedData, context),
        context
      );

      // Step 3: Fact-check the content
      const factCheck = await this.measureOperation(
        "fact-checking",
        () => this.performFactCheck(transcription, extractedData, context),
        context
      );

      // Step 4: Calculate creator credibility
      const credibilityRating = await this.measureOperation(
        "credibility-rating",
        () => this.calculateCredibility(factCheck, extractedData, context),
        context
      );

      const result: BaseAnalysisResult = {
        transcription: transcription || {
          text: "",
          segments: [],
          language: undefined,
        },
        metadata: {
          title: extractedData?.title || `${this.platform} Content`,
          description: extractedData?.description || "",
          creator: extractedData?.creator || "Unknown",
          originalUrl: url,
          platform: this.platform,
        },
        factCheck,
        requiresFactCheck: !!factCheck,
        creatorCredibilityRating: credibilityRating,
      };

      const duration = Date.now() - startTime;
      logger.info(`${this.platform} analysis completed`, {
        requestId: context.requestId,
        platform: this.platform,
        operation: "process",
        duration,
        metadata: {
          hasTranscription: !!transcription?.text,
          hasFactCheck: !!factCheck,
          hasCredibilityRating: credibilityRating !== null,
        },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `${this.platform} analysis failed`,
        {
          requestId: context.requestId,
          platform: this.platform,
          operation: "process",
          duration,
        },
        error as Error
      );

      throw error;
    }
  }

  /**
   * Measure the performance of an operation
   */
  protected async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context: ProcessingContext
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      logger.debug(`${operationName} completed`, {
        requestId: context.requestId,
        platform: this.platform,
        operation: operationName,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.warn(`${operationName} failed`, {
        requestId: context.requestId,
        platform: this.platform,
        operation: operationName,
        duration,
        metadata: {
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  // Abstract methods that each platform must implement
  protected abstract extractContent(
    url: string,
    context: ProcessingContext
  ): Promise<ExtractedContent | null>;

  protected abstract transcribeContent(
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<TranscriptionResult | null>;

  protected abstract performFactCheck(
    transcription: TranscriptionResult | null,
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<FactCheckResult | null>;

  protected abstract calculateCredibility(
    factCheck: FactCheckResult | null,
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<number | null>;
}
