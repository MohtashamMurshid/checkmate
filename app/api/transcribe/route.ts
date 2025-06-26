import { NextRequest, NextResponse } from "next/server";
import {
  validateTranscribeRequest,
  detectPlatform,
  sanitizeUrl,
} from "../../../lib/validation";
import { ApiError } from "../../../lib/api-error";
import { logger } from "../../../lib/logger";
import { checkOperationRateLimit } from "../../../lib/rate-limiter";
import { TikTokHandler } from "./handlers/tiktok-handler";
import { TwitterHandler } from "./handlers/twitter-handler";
import { WebHandler } from "./handlers/web-handler";
import { ProcessingContext } from "./handlers/base-handler";

/**
 * Content Analysis API Endpoint
 *
 * This endpoint analyzes social media and web content for fact-checking and credibility assessment.
 *
 * **Supported Platforms:**
 * - TikTok videos: Extracts video metadata, transcribes audio, fact-checks content
 * - Twitter/X posts: Extracts tweet data, transcribes video if present, fact-checks text
 * - Web articles: Scrapes content, fact-checks articles and blog posts
 *
 * **Features:**
 * - ✅ Multi-platform content analysis
 * - ✅ AI-powered transcription for video content
 * - ✅ Automated fact-checking with source verification
 * - ✅ Creator credibility scoring (0-10 scale)
 * - ✅ Rate limiting and error handling
 * - ✅ Comprehensive logging and monitoring
 *
 * **Request Format:**
 * ```json
 * {
 *   "tiktokUrl": "https://tiktok.com/@user/video/123...",  // OR
 *   "twitterUrl": "https://twitter.com/user/status/123...", // OR
 *   "webUrl": "https://example.com/article",               // OR
 *   "videoUrl": "https://any-video-url.mp4"
 * }
 * ```
 *
 * **Response Format:**
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "transcription": { "text": "...", "segments": [...], "language": "en" },
 *     "metadata": { "title": "...", "creator": "...", "platform": "..." },
 *     "factCheck": { "verdict": "verified", "confidence": 85, "explanation": "..." },
 *     "requiresFactCheck": true,
 *     "creatorCredibilityRating": 7.5
 *   }
 * }
 * ```
 *
 * @param request - HTTP request with URL to analyze
 * @returns Analysis results with fact-check and credibility data
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info("Content analysis request started", {
    requestId,
    operation: "transcribe",
    metadata: {
      method: request.method,
      userAgent: request.headers.get("user-agent")?.slice(0, 100),
    },
  });

  try {
    // Step 1: Validate request body
    const body = await request.json();
    const validatedRequest = validateTranscribeRequest(body);

    logger.debug("Request validated successfully", {
      requestId,
      operation: "validate-request",
      metadata: {
        hasVideoUrl: !!validatedRequest.videoUrl,
        hasTiktokUrl: !!validatedRequest.tiktokUrl,
        hasTwitterUrl: !!validatedRequest.twitterUrl,
        hasWebUrl: !!validatedRequest.webUrl,
      },
    });

    // Step 2: Extract and sanitize the URL
    const rawUrl =
      validatedRequest.webUrl ||
      validatedRequest.twitterUrl ||
      validatedRequest.tiktokUrl ||
      validatedRequest.videoUrl!;

    const sanitizedUrl = sanitizeUrl(rawUrl);
    const platform = detectPlatform(sanitizedUrl);

    logger.info("Platform detected and URL sanitized", {
      requestId,
      operation: "platform-detection",
      platform,
      metadata: { sanitizedUrl },
    });

    // Step 3: Check rate limits for this operation
    const rateLimitResult = checkOperationRateLimit(request, "transcribe");
    if (!rateLimitResult.allowed) {
      logger.warn("Rate limit exceeded", {
        requestId,
        operation: "rate-limit-check",
        platform,
        metadata: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
        },
      });

      return NextResponse.json(
        ApiError.rateLimited(rateLimitResult.retryAfter).toJSON(),
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime
            ).toISOString(),
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
          },
        }
      );
    }

    // Step 4: Create processing context
    const context: ProcessingContext = {
      requestId,
      userId: request.headers.get("x-user-id") || undefined,
      platform,
      url: sanitizedUrl,
      startTime,
    };

    // Step 5: Select appropriate handler based on platform
    let handler;
    switch (platform) {
      case "tiktok":
        handler = new TikTokHandler();
        break;
      case "twitter":
        handler = new TwitterHandler();
        break;
      case "web":
        handler = new WebHandler();
        break;
      default:
        throw ApiError.unsupportedPlatform(sanitizedUrl);
    }

    logger.info("Handler selected, starting content processing", {
      requestId,
      operation: "handler-selection",
      platform,
      metadata: { handlerType: handler.constructor.name },
    });

    // Step 6: Process the content using the selected handler
    const result = await handler.process(sanitizedUrl, context);

    // Step 7: Log success and return results
    const duration = Date.now() - startTime;
    logger.info("Content analysis completed successfully", {
      requestId,
      operation: "transcribe",
      platform,
      duration,
      metadata: {
        hasTranscription: !!result.transcription.text,
        hasFactCheck: !!result.factCheck,
        hasCredibilityRating: result.creatorCredibilityRating !== null,
        factCheckVerdict: result.factCheck?.verdict,
        credibilityRating: result.creatorCredibilityRating,
      },
    });

    return NextResponse.json(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-Processing-Time": duration.toString(),
          "X-Platform": platform,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle known API errors
    if (error instanceof ApiError) {
      logger.warn("API error occurred", {
        requestId,
        operation: "transcribe",
        duration,
        metadata: {
          errorCode: error.code,
          statusCode: error.statusCode,
          errorMessage: error.message,
        },
      });

      return NextResponse.json(error.toJSON(), {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-Error-Code": error.code,
        },
      });
    }

    // Handle unexpected errors
    logger.error("Unexpected error in content analysis", {
      requestId,
      operation: "transcribe",
      duration,
      metadata: {
        errorName: error instanceof Error ? error.name : "Unknown",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    const internalError = ApiError.internalError(error as Error);
    return NextResponse.json(internalError.toJSON(), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        "X-Error-Code": internalError.code,
      },
    });
  }
}

/**
 * Health check endpoint
 * Returns the API status and basic configuration
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "healthy",
    service: "content-analysis-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    supportedPlatforms: ["tiktok", "twitter", "web"],
    features: [
      "video-transcription",
      "fact-checking",
      "credibility-analysis",
      "rate-limiting",
      "structured-logging",
    ],
  });
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-ID",
      "Access-Control-Max-Age": "86400",
    },
  });
}
