import { NextRequest } from "next/server";
import { config } from "./config";
import { ApiError } from "./api-error";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default rate limit configurations
export const RATE_LIMITS = {
  anonymous: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: Math.floor(config.RATE_LIMIT_MAX_REQUESTS * 0.2), // 20% of authenticated limit
  },
  authenticated: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
  premium: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS * 5, // 5x limit for premium users
  },
} as const;

// Default key generator (IP-based)
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

// User-based key generator
function userKeyGenerator(request: NextRequest, userId: string): string {
  return `user:${userId}`;
}

// Clean up expired entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Check rate limit
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
  userId?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to cleanup
    cleanupExpiredEntries();
  }

  const key = userId
    ? userKeyGenerator(request, userId)
    : (options.keyGenerator || defaultKeyGenerator)(request);
  const now = Date.now();
  const resetTime = now + options.windowMs;

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= options.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Rate limit middleware
export function createRateLimitMiddleware(
  getUserTier?: (userId: string) => "anonymous" | "authenticated" | "premium"
) {
  return function rateLimitMiddleware(
    request: NextRequest,
    userId?: string
  ): {
    allowed: boolean;
    headers: Record<string, string>;
    error?: ApiError;
  } {
    // Determine user tier
    const tier = userId
      ? getUserTier?.(userId) || "authenticated"
      : "anonymous";
    const options = RATE_LIMITS[tier];

    // Check rate limit
    const result = checkRateLimit(request, options, userId);

    // Prepare headers
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": options.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    };

    if (!result.allowed) {
      headers["Retry-After"] = result.retryAfter!.toString();
      return {
        allowed: false,
        headers,
        error: ApiError.rateLimited(result.retryAfter),
      };
    }

    return {
      allowed: true,
      headers,
    };
  };
}

// Operation-specific rate limits
export const OPERATION_LIMITS = {
  transcribe: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Max 10 transcriptions per minute
  },
  factCheck: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // Max 5 fact-checks per minute (more expensive)
  },
} as const;

// Operation-specific rate limiter
export function checkOperationRateLimit(
  request: NextRequest,
  operation: keyof typeof OPERATION_LIMITS,
  userId?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const options = OPERATION_LIMITS[operation];
  const keyGenerator = (req: NextRequest) => {
    const base = userId ? `user:${userId}` : defaultKeyGenerator(req);
    return `${base}:${operation}`;
  };

  return checkRateLimit(request, { ...options, keyGenerator }, userId);
}
