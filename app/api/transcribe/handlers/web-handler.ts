import {
  BaseHandler,
  ProcessingContext,
  ExtractedContent,
  TranscriptionResult,
  FactCheckResult,
} from "./base-handler";
import { ApiError } from "../../../../lib/api-error";
import { scrapeWebContent } from "../../../../tools/helpers";
import { researchAndFactCheck } from "../../../../tools/fact-checking";
import { calculateCreatorCredibilityRating } from "../../../../tools/content-analysis";
import { logger } from "../../../../lib/logger";

/**
 * Web content-specific data extracted from the platform
 */
interface WebExtractedData extends ExtractedContent {
  content: string;
  author?: string;
  metadata?: {
    publishedTime?: string;
    modifiedTime?: string;
    keywords?: string;
    language?: string;
  };
  type: "web_content";
}

/**
 * Web content handler
 *
 * Handles the complete processing pipeline for web articles and blog posts:
 * 1. Extract article content and metadata using web scraping
 * 2. Skip transcription (no video content expected)
 * 3. Fact-check the article content
 * 4. Calculate creator/source credibility rating
 *
 * @example
 * ```typescript
 * const handler = new WebHandler();
 * const result = await handler.process(webUrl, context);
 * ```
 */
export class WebHandler extends BaseHandler {
  constructor() {
    super("web");
  }

  /**
   * Extract web content and metadata using web scraping
   * @param url - Web article/blog URL
   * @param context - Processing context
   * @returns Extracted web content data
   * @throws ApiError if extraction fails
   */
  protected async extractContent(
    url: string,
    context: ProcessingContext
  ): Promise<ExtractedContent | null> {
    logger.debug("Extracting web content", {
      requestId: context.requestId,
      platform: this.platform,
      operation: "extract-content",
      metadata: { url },
    });

    try {
      const scrapeResult = await scrapeWebContent(url);

      if (!scrapeResult.success || !scrapeResult.data) {
        throw ApiError.webScrapeFailed(
          url,
          new Error(
            scrapeResult.error || "Web scraping returned unsuccessful status"
          )
        );
      }

      const data = scrapeResult.data;

      const extractedData: WebExtractedData = {
        title: data.title || "Web Content",
        description: data.description || data.title || "",
        creator: data.author || "Unknown",
        content: data.content || "",
        author: data.author,
        metadata: data.metadata,
        type: "web_content",
      };

      return extractedData;
    } catch (error) {
      logger.error(
        "Web content extraction failed",
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

      throw ApiError.webScrapeFailed(url, error as Error);
    }
  }

  /**
   * Web content doesn't typically have video, so transcription is skipped
   * @param extractedData - Data extracted from web
   * @param context - Processing context
   * @returns Always null for web content
   */
  protected async transcribeContent(
    extractedData: ExtractedContent | null,
    context: ProcessingContext
  ): Promise<TranscriptionResult | null> {
    logger.debug("Skipping transcription for web content", {
      requestId: context.requestId,
      platform: this.platform,
      operation: "transcribe-content",
      metadata: { contentType: "web_content" },
    });

    // Web content doesn't have video to transcribe
    return null;
  }

  /**
   * Fact-check the web article content
   * @param transcription - Always null for web content
   * @param extractedData - Original web content data
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

    const webData = extractedData as WebExtractedData;
    const textToFactCheck = webData.content || webData.description;

    if (!textToFactCheck || textToFactCheck.trim().length === 0) {
      logger.debug("No content available for fact-checking", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "fact-check",
        metadata: {
          hasContent: !!webData.content,
          hasDescription: !!webData.description,
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
          author: webData.creator,
          title: webData.title,
        },
      });

      const contextPrompt = `Web Content Analysis Context:
- Source: ${webData.creator}
- Article Title: "${webData.title}"
- Article Content: "${webData.description}"
- Article URL: ${context.url}
- Platform: Web Article/Blog
- Publication Date: ${webData.metadata?.publishedTime || "Unknown"}
- Language: ${webData.metadata?.language || "Unknown"}

Please fact-check the claims from this web article content, paying special attention to the article content and any factual claims made. Consider the context that this is web content that may contain opinions, analysis, or claims that need verification.`;

      const factCheck = await researchAndFactCheck.execute(
        {
          transcription: textToFactCheck,
          title: webData.title,
          context: contextPrompt,
        },
        {
          toolCallId: "web-verification",
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
            title: webData.title,
          },
        });

        return factCheckResult;
      }

      logger.warn("Fact-check service returned unsuccessful result", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "fact-check",
        metadata: { success: factCheck.success, title: webData.title },
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
          metadata: { title: webData.title },
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
   * Calculate source/creator credibility rating based on fact-check results
   * @param factCheck - Fact-check results
   * @param extractedData - Original web content data
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

    const webData = extractedData as WebExtractedData;

    try {
      logger.debug("Calculating source credibility", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
        metadata: {
          source: webData.creator,
          factCheckVerdict: factCheck.verdict,
          title: webData.title,
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
            creator: webData.creator || "Unknown",
            platform: this.platform,
            title: webData.title || "",
            hasTranscription: false, // Web content doesn't have transcription
            contentType: webData.type,
          },
          analysisMetrics: {
            hasNewsContent: true,
            needsFactCheck: true,
            contentLength: webData.content.length,
          },
        },
        {
          toolCallId: "web-credibility-rating",
          messages: [],
        }
      );

      if (credibilityResult.success && credibilityResult.data) {
        const rating = credibilityResult.data.credibilityRating;

        logger.info("Source credibility calculated", {
          requestId: context.requestId,
          platform: this.platform,
          operation: "calculate-credibility",
          metadata: {
            source: webData.creator,
            rating,
            title: webData.title,
          },
        });

        return rating;
      }

      logger.warn("Credibility calculation returned unsuccessful result", {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
        metadata: {
          success: credibilityResult.success,
          title: webData.title,
        },
      });

      return null;
    } catch (error) {
      logger.warn(`Source credibility calculation failed: ${error}`, {
        requestId: context.requestId,
        platform: this.platform,
        operation: "calculate-credibility",
        metadata: { title: webData.title },
      });

      return null;
    }
  }
}
