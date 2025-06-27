export enum ApiErrorCode {
  // Input validation errors
  INVALID_URL = "INVALID_URL",
  MISSING_URL = "MISSING_URL",
  UNSUPPORTED_PLATFORM = "UNSUPPORTED_PLATFORM",

  // External service errors
  TIKTOK_FETCH_FAILED = "TIKTOK_FETCH_FAILED",
  TWITTER_FETCH_FAILED = "TWITTER_FETCH_FAILED",
  WEB_SCRAPE_FAILED = "WEB_SCRAPE_FAILED",
  TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
  FACT_CHECK_FAILED = "FACT_CHECK_FAILED",

  // Configuration errors
  MISSING_API_KEY = "MISSING_API_KEY",
  INVALID_CONFIG = "INVALID_CONFIG",

  // Rate limiting
  RATE_LIMITED = "RATE_LIMITED",

  // Timeout errors
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",

  // Internal errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApiError);
  }

  static invalidUrl(url: string, platform?: string): ApiError {
    return new ApiError(
      ApiErrorCode.INVALID_URL,
      `Invalid URL format${platform ? ` for ${platform}` : ""}`,
      400,
      true,
      { url, platform }
    );
  }

  static missingUrl(): ApiError {
    return new ApiError(
      ApiErrorCode.MISSING_URL,
      "A URL is required (videoUrl, tiktokUrl, twitterUrl, or webUrl)",
      400
    );
  }

  static unsupportedPlatform(url: string): ApiError {
    return new ApiError(
      ApiErrorCode.UNSUPPORTED_PLATFORM,
      "Unsupported platform or URL format",
      400,
      true,
      { url }
    );
  }

  static tiktokFetchFailed(url: string, originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.TIKTOK_FETCH_FAILED,
      "Failed to fetch TikTok video data",
      503,
      true,
      { url, originalError: originalError?.message }
    );
  }

  static twitterFetchFailed(tweetId: string, originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.TWITTER_FETCH_FAILED,
      "Failed to fetch Twitter post data",
      503,
      true,
      { tweetId, originalError: originalError?.message }
    );
  }

  static webScrapeFailed(url: string, originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.WEB_SCRAPE_FAILED,
      "Failed to scrape web content",
      503,
      true,
      { url, originalError: originalError?.message }
    );
  }

  static transcriptionFailed(originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.TRANSCRIPTION_FAILED,
      "Failed to transcribe video content",
      503,
      true,
      { originalError: originalError?.message }
    );
  }

  static factCheckFailed(originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.FACT_CHECK_FAILED,
      "Fact-checking service temporarily unavailable",
      503,
      true,
      { originalError: originalError?.message }
    );
  }

  static missingApiKey(service: string): ApiError {
    return new ApiError(
      ApiErrorCode.MISSING_API_KEY,
      `${service} API key not configured`,
      500,
      false,
      { service }
    );
  }

  static rateLimited(retryAfter?: number): ApiError {
    return new ApiError(
      ApiErrorCode.RATE_LIMITED,
      "Too many requests. Please try again later.",
      429,
      true,
      { retryAfter }
    );
  }

  static requestTimeout(operation: string, timeoutMs: number): ApiError {
    return new ApiError(
      ApiErrorCode.REQUEST_TIMEOUT,
      `${operation} operation timed out`,
      408,
      true,
      { operation, timeoutMs }
    );
  }

  static internalError(originalError?: Error): ApiError {
    return new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      "An internal server error occurred",
      500,
      false,
      { originalError: originalError?.message }
    );
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.context && { context: this.context }),
      },
    };
  }
}
