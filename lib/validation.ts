import { z } from "zod";
import { ApiError, ApiErrorCode } from "./api-error";

// URL validation patterns
const TIKTOK_URL_PATTERN =
  /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
const TWITTER_URL_PATTERN =
  /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;

// Request schemas
export const transcribeRequestSchema = z
  .object({
    videoUrl: z.string().url().optional(),
    tiktokUrl: z.string().url().optional(),
    twitterUrl: z.string().url().optional(),
    webUrl: z.string().url().optional(),
  })
  .refine(
    (data) => data.videoUrl || data.tiktokUrl || data.twitterUrl || data.webUrl,
    {
      message: "At least one URL parameter is required",
      path: ["url"],
    }
  );

export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>;

// Platform detection
export function detectPlatform(url: string): "tiktok" | "twitter" | "web" {
  if (TIKTOK_URL_PATTERN.test(url)) {
    return "tiktok";
  } else if (TWITTER_URL_PATTERN.test(url)) {
    return "twitter";
  } else {
    return "web";
  }
}

// URL validation
export function validateUrl(url: string, platform?: string): void {
  // Basic URL validation
  try {
    new URL(url);
  } catch {
    throw ApiError.invalidUrl(url, platform);
  }

  // Platform-specific validation
  if (platform === "twitter" && !TWITTER_URL_PATTERN.test(url)) {
    throw ApiError.invalidUrl(url, "Twitter");
  } else if (platform === "tiktok" && !TIKTOK_URL_PATTERN.test(url)) {
    throw ApiError.invalidUrl(url, "TikTok");
  }
}

// URL sanitization
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    // Remove tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ref_src",
      "ref_url",
      "_nc_ht",
    ];

    trackingParams.forEach((param) => {
      parsedUrl.searchParams.delete(param);
    });

    return parsedUrl.toString();
  } catch {
    // If URL parsing fails, return original (validation will catch this)
    return url;
  }
}

// Extract identifiers from URLs
export function extractTweetId(url: string): string {
  const match = url.match(/status\/(\d+)/);
  if (!match) {
    throw ApiError.invalidUrl(url, "Twitter");
  }
  return match[1];
}

// Content validation
export function validateContent(
  content: string,
  maxLength: number = 50000
): string {
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + "...";
  }

  // Basic content sanitization (remove potential script tags, etc.)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .trim();
}

// Request validation middleware
export function validateTranscribeRequest(body: unknown): TranscribeRequest {
  try {
    return transcribeRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ApiError(
        firstError.path.includes("url")
          ? ApiErrorCode.MISSING_URL
          : ApiErrorCode.INVALID_URL,
        firstError.message,
        400,
        true,
        { validationErrors: error.errors }
      );
    }
    throw ApiError.internalError(error as Error);
  }
}

// Response schemas for type safety
export const transcriptionSchema = z.object({
  text: z.string(),
  segments: z.array(z.unknown()),
  language: z.string().optional(),
});

export const metadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  creator: z.string(),
  originalUrl: z.string(),
  platform: z.string(),
});

export const factCheckSchema = z.object({
  verdict: z.enum(["verified", "true", "false", "misleading", "unverifiable"]),
  confidence: z.number().min(0).max(100),
  explanation: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      source: z.string().optional(),
      relevance: z.number().optional(),
    })
  ),
  content: z.string(),
  isVerified: z.boolean(),
  error: z.string().optional(),
});

export const transcribeResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      transcription: transcriptionSchema,
      metadata: metadataSchema,
      factCheck: factCheckSchema.nullable(),
      requiresFactCheck: z.boolean(),
      creatorCredibilityRating: z.number().min(0).max(10).nullable(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      context: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;
