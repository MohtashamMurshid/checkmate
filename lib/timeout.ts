import { config } from "./config";
import { ApiError, ApiErrorCode } from "./api-error";
import { logger } from "./logger";

// Timeout wrapper for promises
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(ApiError.requestTimeout(operation, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Retry configuration
interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

// Default retry logic for different error types
function shouldRetryDefault(error: Error): boolean {
  // Retry on network errors, timeouts, and 5xx status codes
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return true; // Network error
  }

  if (error instanceof ApiError) {
    // Don't retry client errors (4xx), but retry server errors (5xx)
    return error.statusCode >= 500;
  }

  return false;
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  operation: string
): Promise<T> {
  const {
    maxAttempts,
    delayMs,
    backoffMultiplier = 2,
    maxDelayMs = 30000, // 30 seconds max
    shouldRetry = shouldRetryDefault,
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();

      if (attempt > 1) {
        logger.info(`${operation} succeeded after ${attempt} attempts`);
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        logger.error(
          `${operation} failed after ${attempt} attempts`,
          undefined,
          lastError
        );
        throw lastError;
      }

      logger.warn(
        `${operation} attempt ${attempt} failed, retrying in ${currentDelay}ms`,
        {
          operation,
          metadata: {
            attempt: attempt,
            delayMs: currentDelay,
            error: lastError.message,
          },
        }
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Exponential backoff
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError!;
}

// Circuit breaker state
enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Circuit is open, rejecting requests
  HALF_OPEN = "half-open", // Testing if service is back
}

interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time to wait before trying half-open
  monitor?: (state: CircuitState, error?: Error) => void;
}

// Circuit breaker implementation
export class CircuitBreaker<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly options: CircuitBreakerOptions;
  private readonly name: string;

  constructor(name: string, options: CircuitBreakerOptions) {
    this.name = name;
    this.options = options;
  }

  async execute(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.options.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info(`Circuit breaker ${this.name} entering half-open state`);
      } else {
        throw new ApiError(
          ApiErrorCode.INTERNAL_ERROR,
          `Circuit breaker is open for ${this.name}`,
          503
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        logger.info(`Circuit breaker ${this.name} closed`);
        this.options.monitor?.(this.state);
      }
    }
  }

  private onFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      logger.warn(`Circuit breaker ${this.name} opened from half-open state`);
      this.options.monitor?.(this.state, error);
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.options.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      logger.warn(
        `Circuit breaker ${this.name} opened due to ${this.failureCount} failures`
      );
      this.options.monitor?.(this.state, error);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Pre-configured circuit breakers for different services
export const circuitBreakers = {
  tiktok: new CircuitBreaker("tiktok-api", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  }),

  twitter: new CircuitBreaker("twitter-api", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  }),

  firecrawl: new CircuitBreaker("firecrawl-api", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  }),

  transcription: new CircuitBreaker("transcription-service", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 120000, // 2 minutes
  }),

  factCheck: new CircuitBreaker("fact-check-service", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 180000, // 3 minutes
  }),
} as const;

// Convenience functions for different operations
export const timeouts = {
  transcription: () =>
    withTimeout(
      Promise.resolve(),
      config.TRANSCRIPTION_TIMEOUT_MS,
      "transcription"
    ),

  factCheck: () =>
    withTimeout(Promise.resolve(), config.FACT_CHECK_TIMEOUT_MS, "fact-check"),

  webScrape: () =>
    withTimeout(Promise.resolve(), config.WEB_SCRAPE_TIMEOUT_MS, "web-scrape"),
} as const;

// Combined timeout + retry + circuit breaker
export async function executeWithResilience<T>(
  fn: () => Promise<T>,
  operation: string,
  circuitBreaker?: CircuitBreaker<T>,
  timeoutMs?: number,
  retryOptions?: Partial<RetryOptions>
): Promise<T> {
  const wrappedFn = async () => {
    const fnWithTimeout = timeoutMs
      ? () => withTimeout(fn(), timeoutMs, operation)
      : fn;

    if (circuitBreaker) {
      return circuitBreaker.execute(fnWithTimeout);
    }

    return fnWithTimeout();
  };

  if (retryOptions) {
    const defaultRetryOptions: RetryOptions = {
      maxAttempts: 3,
      delayMs: 1000,
      ...retryOptions,
    };

    return withRetry(wrappedFn, defaultRetryOptions, operation);
  }

  return wrappedFn();
}
