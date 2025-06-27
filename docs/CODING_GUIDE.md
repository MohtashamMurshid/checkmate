# Coding Guide

This guide establishes the coding standards, conventions, and best practices for the Checkmate project. It covers TypeScript/React development, API design, database operations, and documentation requirements.

## Table of Contents

- [Project Overview](#project-overview)
- [Code Quality Standards](#code-quality-standards)
- [TypeScript Guidelines](#typescript-guidelines)
- [React Component Patterns](#react-component-patterns)
- [API Development](#api-development)
- [Database Operations](#database-operations)
- [Testing Standards](#testing-standards)
- [Documentation Requirements](#documentation-requirements)
- [Error Handling](#error-handling)
- [Performance Guidelines](#performance-guidelines)
- [Security Best Practices](#security-best-practices)

## Project Overview

The Checkmate project is a Next.js 15+ application using:

- **Frontend:** React 19, Next.js 15, TypeScript 5, Tailwind CSS 4
- **Backend:** Convex (serverless backend), Next.js API routes
- **Authentication:** Clerk
- **UI Components:** Radix UI + shadcn/ui
- **Validation:** Zod
- **State Management:** React hooks + Convex real-time queries

## Code Quality Standards

### 1. Linting and Formatting

We use ESLint with Next.js TypeScript configuration:

```bash
# Run linting
npm run lint

# Check for linting issues in CI/CD
npm run lint -- --quiet
```

**Configuration:**

```typescript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### 2. TypeScript Configuration

**Strict mode is enabled** with the following key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "target": "ES2017",
    "moduleResolution": "bundler"
  }
}
```

**Type Safety Requirements:**

- ✅ All functions must have explicit return types
- ✅ Use strict type checking (`strict: true`)
- ✅ Avoid `any` types - use `unknown` or proper typing
- ✅ Use type guards for runtime validation
- ✅ Define interfaces for all complex data structures

### 3. Import Organization

**Import order:**

```typescript
// 1. External libraries
import { useState, useEffect } from "react";
import { z } from "zod";

// 2. Internal utilities and configs
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-error";

// 3. Components (UI first, then custom)
import { Button } from "@/components/ui/button";
import { AnalysisCard } from "@/components/analysis/analysis-card";

// 4. Types and interfaces
import type { TranscribeRequest } from "@/types";
```

## TypeScript Guidelines

### 1. Type Definitions

**Define clear interfaces for all data structures:**

```typescript
/**
 * Analysis data interface for TikTok content
 */
interface TikTokAnalysisData {
  transcription: TranscriptionData;
  metadata: {
    title: string;
    description: string;
    creator: string;
    originalUrl: string;
    platform?: string;
  };
  newsDetection: NewsDetection | null;
  factCheck: FactCheckData | null;
  requiresFactCheck: boolean;
  creatorCredibilityRating?: number;
}
```

**Use discriminated unions for type safety:**

```typescript
interface SuccessResponse {
  success: true;
  data: TikTokAnalysisData;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;
```

### 2. Runtime Validation with Zod

**Always validate external data:**

```typescript
import { z } from "zod";

// Define schema
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

// Extract type
export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>;

// Validate function
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
```

### 3. Generic Types and Utilities

**Create reusable type utilities:**

```typescript
// Common utility types
type Nullable<T> = T | null;
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}
```

## React Component Patterns

### 1. Component Structure

**Follow this component structure:**

````typescript
/**
 * Component description and purpose
 * Used in: List of where this component is used
 */

"use client"; // Only if client-side features are needed

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Props interface with JSDoc descriptions
 */
interface ComponentProps {
  /** Required prop description */
  data: AnalysisData;
  /** Optional prop description */
  className?: string;
  /** Callback function description */
  onAction?: (id: string) => void;
}

/**
 * Helper sub-component (if needed)
 */
const HelperComponent = ({ rating }: { rating: number }) => {
  const getBadgeClass = () => {
    if (rating > 7) return "bg-green-100 text-green-800";
    if (rating >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass()}`}>
      Rating: {rating.toFixed(1)}
    </span>
  );
};

/**
 * Main component with JSDoc description
 *
 * @example
 * ```tsx
 * <ComponentName data={analysisData} onAction={handleAction} />
 * ```
 */
export const ComponentName = ({ data, className, onAction }: ComponentProps) => {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleClick = () => {
    if (onAction) {
      onAction(data.id);
    }
  };

  // Early returns for loading/error states
  if (!data) {
    return <div>No data available</div>;
  }

  // Main render
  return (
    <div className={cn("default-classes", className)}>
      <HelperComponent rating={data.rating} />
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Action"}
      </Button>
    </div>
  );
};
````

### 2. Custom Hooks

**Follow this pattern for custom hooks:**

```typescript
import { useState } from "react";
import { useConvexAuth } from "convex/react";

/**
 * Custom hook for TikTok analysis functionality
 *
 * @returns Object with analysis functions and state
 */
export function useTikTokAnalysis() {
  const { isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TikTokAnalysisResult | null>(null);

  const analyzeTikTok = async (
    url: string,
    saveToDb = false
  ): Promise<TikTokAnalysisResult> => {
    setIsLoading(true);
    setResult(null);

    try {
      // Validation
      try {
        new URL(url);
      } catch {
        throw new Error("Invalid URL format. Please provide a valid URL.");
      }

      // API call logic
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiktokUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze content");
      }

      const analysis: TikTokAnalysisResult = await response.json();
      setResult(analysis);
      return analysis;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
    reset,
    isLoading,
    result,
  };
}
```

### 3. Server Components vs Client Components

**Use Server Components by default:**

```typescript
// app/news/page.tsx - Server Component (default)
import { getAllAnalyses } from "@/convex/queries";
import { AnalysisCard } from "@/components/analysis/analysis-card";

export default async function NewsPage() {
  // Server-side data fetching
  const analyses = await getAllAnalyses();

  return (
    <div>
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis._id} analysis={analysis} />
      ))}
    </div>
  );
}
```

**Use Client Components for interactivity:**

```typescript
// components/analysis/interactive-card.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export const InteractiveCard = ({ analysis }: { analysis: Analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Collapse" : "Expand"}
      </Button>
      {isExpanded && <div>{analysis.details}</div>}
    </div>
  );
};
```

## API Development

### 1. Next.js API Routes

**Structure API routes with proper error handling:**

````typescript
import { NextRequest, NextResponse } from "next/server";
import { validateTranscribeRequest } from "@/lib/validation";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

/**
 * Content Analysis API Endpoint
 *
 * This endpoint analyzes social media and web content for fact-checking.
 *
 * **Supported Platforms:**
 * - TikTok videos: Extracts metadata, transcribes audio, fact-checks content
 * - Twitter/X posts: Extracts tweet data, fact-checks text
 * - Web articles: Scrapes content, fact-checks articles
 *
 * **Request Format:**
 * ```json
 * {
 *   "tiktokUrl": "https://tiktok.com/@user/video/123...",
 *   "twitterUrl": "https://twitter.com/user/status/123...",
 *   "webUrl": "https://example.com/article"
 * }
 * ```
 *
 * **Response Format:**
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "transcription": { "text": "...", "language": "en" },
 *     "metadata": { "title": "...", "creator": "..." },
 *     "factCheck": { "verdict": "verified", "confidence": 85 }
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info("Content analysis request started", {
    requestId,
    operation: "transcribe",
  });

  try {
    // Step 1: Validate request
    const body = await request.json();
    const validatedRequest = validateTranscribeRequest(body);

    // Step 2: Process request
    const result = await processContent(validatedRequest);

    // Step 3: Return success response
    const duration = Date.now() - startTime;
    logger.info("Content analysis completed", {
      requestId,
      duration,
      metadata: { hasFactCheck: !!result.factCheck },
    });

    return NextResponse.json(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-Processing-Time": duration.toString(),
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
        error: error.toJSON(),
      });

      return NextResponse.json(error.toJSON(), {
        status: error.statusCode,
        headers: { "X-Request-ID": requestId },
      });
    }

    // Handle unexpected errors
    logger.error(
      "Unexpected error in transcribe API",
      { requestId },
      error as Error
    );

    return NextResponse.json(ApiError.internalError(error as Error).toJSON(), {
      status: 500,
      headers: { "X-Request-ID": requestId },
    });
  }
}

// OPTIONS method for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
````

### 2. Handler Pattern

**Use abstract base classes for consistent API handlers:**

```typescript
/**
 * Abstract base handler for platform-specific content processing
 */
export abstract class BaseHandler {
  protected readonly platform: string;

  constructor(platform: string) {
    this.platform = platform;
  }

  /**
   * Main entry point for processing content
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
    });

    try {
      // Step 1: Extract content
      const extractedData = await this.measureOperation(
        "content-extraction",
        () => this.extractContent(url, context),
        context
      );

      // Step 2: Transcribe content
      const transcription = await this.measureOperation(
        "transcription",
        () => this.transcribeContent(extractedData, context),
        context
      );

      // Step 3: Fact-check
      const factCheck = await this.measureOperation(
        "fact-checking",
        () => this.performFactCheck(transcription, extractedData, context),
        context
      );

      // Step 4: Calculate credibility
      const credibilityRating = await this.measureOperation(
        "credibility-rating",
        () => this.calculateCredibility(factCheck, extractedData, context),
        context
      );

      return {
        transcription: transcription || { text: "", segments: [] },
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
    } catch (error) {
      logger.error(
        `${this.platform} analysis failed`,
        {
          requestId: context.requestId,
          platform: this.platform,
        },
        error as Error
      );
      throw error;
    }
  }

  // Abstract methods that must be implemented by subclasses
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
```

## Database Operations

### 1. Convex Function Patterns

**Query functions (read-only):**

```typescript
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get analyses by user with optional filtering
 */
export const getUserAnalyses = query({
  args: {
    userId: v.id("users"),
    requiresFactCheck: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new Error("Unauthorized access");
    }

    // Base query with index
    let query = ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    // Apply optional filters
    if (args.requiresFactCheck !== undefined) {
      query = query.filter((q) =>
        q.eq(q.field("requiresFactCheck"), args.requiresFactCheck!)
      );
    }

    // Order and limit
    const results = await query.order("desc").take(args.limit || 50);

    return results;
  },
});
```

**Mutation functions (write operations):**

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Create new TikTok analysis with validation
 */
export const createTikTokAnalysis = mutation({
  args: {
    videoUrl: v.string(),
    transcription: v.object({
      text: v.string(),
      duration: v.optional(v.number()),
      language: v.optional(v.string()),
    }),
    metadata: v.object({
      title: v.string(),
      description: v.string(),
      creator: v.string(),
      originalUrl: v.string(),
      platform: v.string(),
    }),
    requiresFactCheck: v.boolean(),
  },
  async handler(ctx, args) {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get user record
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Create analysis
    const analysisId = await ctx.db.insert("tiktokAnalyses", {
      userId: user._id,
      videoUrl: args.videoUrl,
      transcription: args.transcription,
      metadata: args.metadata,
      requiresFactCheck: args.requiresFactCheck,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});
```

### 2. Error Handling in Database Operations

```typescript
export const safeUpdateOperation = mutation({
  args: { id: v.id("tiktokAnalyses"), updates: v.object({}) },
  async handler(ctx, args) {
    try {
      // Check if resource exists
      const analysis = await ctx.db.get(args.id);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      // Check authorization
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || analysis.userId !== identity.subject) {
        throw new Error("Unauthorized");
      }

      // Perform update
      await ctx.db.patch(args.id, {
        ...args.updates,
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      // Log error for debugging
      console.error("Update operation failed:", error);

      // Re-throw with context
      throw new Error(
        `Failed to update analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});
```

## Documentation Requirements

### 1. JSDoc Standards

**All public functions and components must have JSDoc comments:**

````typescript
/**
 * Analyzes TikTok video content for fact-checking and credibility assessment
 *
 * @param url - The TikTok video URL to analyze
 * @param options - Configuration options for the analysis
 * @param options.saveToDb - Whether to save results to database
 * @param options.includeFactCheck - Whether to perform fact-checking
 * @returns Promise resolving to analysis results
 *
 * @throws {ApiError} When URL is invalid or analysis fails
 *
 * @example
 * ```typescript
 * const result = await analyzeTikTokContent(
 *   "https://tiktok.com/@user/video/123",
 *   { saveToDb: true, includeFactCheck: true }
 * );
 *
 * if (result.success) {
 *   console.log("Analysis completed:", result.data);
 * }
 * ```
 */
export async function analyzeTikTokContent(
  url: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  // Implementation...
}
````

### 2. README Files

**Each major directory should have a README.md:**

````markdown
# Components Directory

This directory contains all React components organized by feature and type.

## Structure

- `ui/` - Reusable UI components (buttons, inputs, etc.)
- `analysis/` - Components related to content analysis
- `creator/` - Creator profile and credibility components
- `news/` - News and fact-checking related components

## Usage

```tsx
import { AnalysisCard } from "@/components/analysis";
import { Button } from "@/components/ui/button";
```
````

## Guidelines

- All components should be documented with JSDoc
- Use TypeScript for all component props
- Follow the component patterns in this guide
- Export components from index files for clean imports

````

## Error Handling

### 1. Custom Error Classes

```typescript
// lib/api-error.ts
export enum ApiErrorCode {
  INVALID_URL = "INVALID_URL",
  MISSING_URL = "MISSING_URL",
  RATE_LIMITED = "RATE_LIMITED",
  PROCESSING_FAILED = "PROCESSING_FAILED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static invalidUrl(url: string, platform?: string): ApiError {
    return new ApiError(
      ApiErrorCode.INVALID_URL,
      `Invalid ${platform || "URL"} format: ${url}`,
      400,
      true,
      { url, platform }
    );
  }

  static rateLimited(retryAfter?: number): ApiError {
    return new ApiError(
      ApiErrorCode.RATE_LIMITED,
      "Rate limit exceeded. Please try again later.",
      429,
      true,
      { retryAfter }
    );
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        context: this.context,
      },
    };
  }
}
````

## Performance Guidelines

### 1. React Optimization

```typescript
// Use memo for expensive computations
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// Use callback for event handlers
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onIncrement={handleIncrement} />;
};
```

### 2. Database Query Optimization

```typescript
// Use appropriate indexes
export const getAnalysesByUser = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    // Good: Uses index
    return await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20); // Always limit results
  },
});

// Avoid: Full table scan
export const getBadQuery = query({
  async handler(ctx) {
    return await ctx.db
      .query("tiktokAnalyses")
      .filter((q) => q.eq(q.field("requiresFactCheck"), true)) // No index
      .collect(); // No limit
  },
});
```

## Security Best Practices

### 1. Input Validation

```typescript
// Always validate and sanitize inputs
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    // Remove tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "fbclid",
      "gclid",
      "ref_src",
      "ref_url",
    ];

    trackingParams.forEach((param) => {
      parsedUrl.searchParams.delete(param);
    });

    return parsedUrl.toString();
  } catch {
    throw new ApiError(ApiErrorCode.INVALID_URL, "Invalid URL format", 400);
  }
}

// Validate content length and sanitize
export function validateContent(content: string, maxLength = 50000): string {
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + "...";
  }

  // Remove dangerous HTML
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .trim();
}
```

### 2. Authentication Checks

```typescript
// Always verify authentication in protected operations
export const protectedMutation = mutation({
  args: { data: v.string() },
  async handler(ctx, args) {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Verify user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Proceed with operation
    // ...
  },
});
```

## Conclusion

This guide establishes the foundation for high-quality, maintainable code in the Checkmate project. Key principles:

1. **Type Safety First** - Use TypeScript strictly with proper validation
2. **Clear Documentation** - Document all public APIs and complex logic
3. **Error Handling** - Handle errors gracefully with proper user feedback
4. **Performance** - Optimize for both development and runtime performance
5. **Security** - Validate all inputs and protect user data
6. **Testing** - Write tests for critical functionality
7. **Consistency** - Follow established patterns throughout the codebase

When in doubt, refer to existing code in the repository that follows these patterns, and don't hesitate to ask questions in code reviews.
