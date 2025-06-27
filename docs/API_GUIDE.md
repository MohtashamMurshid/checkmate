# API Guide

This guide covers all the API endpoints, interfaces, and data structures used in the Checkmate project.

## Overview

The Checkmate API provides endpoints for:

- Video analysis and transcription
- Fact-checking operations
- Creator credibility management
- User authentication and authorization

## API Architecture

### REST Endpoints

- **Base URL:** `/api/`
- **Authentication:** Clerk JWT tokens
- **Content Type:** `application/json`
- **Rate Limiting:** Per-user limits configured

### Convex Functions

- **Real-time queries** for data retrieval
- **Mutations** for data modification
- **Type-safe** operations with generated types

## REST API Endpoints

### Video Analysis

#### `POST /api/transcribe`

Analyzes a TikTok video URL, performs transcription, and optional fact-checking.

**Request:**

```typescript
interface TranscribeRequest {
  url: string;
}
```

**Response:**

```typescript
interface TranscribeResponse {
  success: boolean;
  data?: {
    transcription: {
      text: string;
      duration?: number;
      language?: string;
    };
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
  };
  error?: {
    code: string;
    message: string;
    context?: Record<string, unknown>;
  };
}
```

**Example:**

```bash
curl -X POST /api/transcribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-token>" \
  -d '{"url": "https://www.tiktok.com/@user/video/123"}'
```

## Convex API Functions

### Query Functions (Read-Only)

#### User Analyses

**`getUserTikTokAnalyses()`**

```typescript
// Get current user's analyses
const analyses = useQuery(api.tiktokAnalyses.getUserTikTokAnalyses);
```

**`getTikTokAnalysisById(analysisId)`**

```typescript
// Get specific analysis by ID
const analysis = useQuery(api.tiktokAnalyses.getTikTokAnalysisById, {
  analysisId: "j57abc123..." as Id<"tiktokAnalyses">,
});
```

#### Creator Information

**`getContentCreator(creatorId, platform)`**

```typescript
// Get creator info and credibility
const creator = useQuery(api.tiktokAnalyses.getContentCreator, {
  creatorId: "@username",
  platform: "tiktok",
});
```

**`getTopCreatorsByCredibility(platform?, limit?)`**

```typescript
// Get top credible creators
const topCreators = useQuery(api.tiktokAnalyses.getTopCreatorsByCredibility, {
  platform: "tiktok",
  limit: 10,
});
```

#### Statistics

**`getAllAnalysisStats()`**

```typescript
// Get global analysis statistics
const stats = useQuery(api.tiktokAnalyses.getAllAnalysisStats);
```

**`getUserAnalysisStats()`**

```typescript
// Get user-specific statistics
const userStats = useQuery(api.tiktokAnalyses.getUserAnalysisStats);
```

### Mutation Functions (Write Operations)

#### Analysis Management

**`saveTikTokAnalysis(data)`**

```typescript
const saveAnalysis = useMutation(api.tiktokAnalyses.saveTikTokAnalysis);

await saveAnalysis({
  videoUrl: "https://tiktok.com/@user/video/123",
  transcription: { text: "...", duration: 30 },
  metadata: { title: "Video Title", creator: "@user" },
  requiresFactCheck: true,
});
```

**`deleteTikTokAnalysis(analysisId)`**

```typescript
const deleteAnalysis = useMutation(api.tiktokAnalyses.deleteTikTokAnalysis);

await deleteAnalysis({
  analysisId: "j57abc123..." as Id<"tiktokAnalyses">,
});
```

#### Creator Management

**`getOrCreateContentCreator(creatorId, platform, creatorName?)`**

```typescript
const createCreator = useMutation(api.tiktokAnalyses.getOrCreateContentCreator);

const creator = await createCreator({
  creatorId: "@username",
  platform: "tiktok",
  creatorName: "Display Name",
});
```

**`updateCreatorCredibilityRating(contentCreatorId, newRating)`**

```typescript
const updateRating = useMutation(
  api.tiktokAnalyses.updateCreatorCredibilityRating
);

await updateRating({
  contentCreatorId: "j58def456..." as Id<"contentCreators">,
  newRating: 7.5,
});
```

## Data Types & Interfaces

### Core Data Types

```typescript
// Analysis result
interface TikTokAnalysis {
  _id: Id<"tiktokAnalyses">;
  userId: Id<"users">;
  videoUrl: string;
  transcription?: {
    text: string;
    duration?: number;
    language?: string;
  };
  metadata?: VideoMetadata;
  newsDetection?: NewsDetection;
  factCheck?: FactCheckResult;
  creatorCredibilityRating?: number;
  contentCreatorId?: Id<"contentCreators">;
  requiresFactCheck: boolean;
  createdAt: number;
}

// Video metadata
interface VideoMetadata {
  title: string;
  description?: string;
  creator?: string;
  originalUrl: string;
  contentType?: string;
  platform?: string;
}

// Fact-check result
interface FactCheckResult {
  verdict?: "verified" | "true" | "false" | "misleading" | "unverifiable";
  confidence?: number; // 0-100
  explanation?: string;
  content?: string;
  isVerified?: boolean;
  sources?: FactCheckSource[];
  error?: string;
}

// Fact-check source
interface FactCheckSource {
  title: string;
  url: string;
  source?: string;
  relevance?: number;
}

// Content creator
interface ContentCreator {
  _id: Id<"contentCreators">;
  creatorId: string;
  platform: string;
  creatorName?: string;
  credibilityRating: number; // 0-10
  totalAnalyses: number;
  totalCredibilityScore: number;
  lastAnalyzedAt: number;
  createdAt: number;
  updatedAt: number;
}
```

### Error Types

```typescript
enum ApiErrorCode {
  INVALID_URL = "INVALID_URL",
  MISSING_URL = "MISSING_URL",
  UNSUPPORTED_PLATFORM = "UNSUPPORTED_PLATFORM",
  TIKTOK_FETCH_FAILED = "TIKTOK_FETCH_FAILED",
  TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
  FACT_CHECK_FAILED = "FACT_CHECK_FAILED",
  RATE_LIMITED = "RATE_LIMITED",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}

interface ApiError {
  code: ApiErrorCode;
  message: string;
  context?: Record<string, unknown>;
}
```

## Authentication & Authorization

### Authentication Flow

1. **User signs in** via Clerk (OAuth/email)
2. **JWT token issued** by Clerk
3. **Token included** in API requests
4. **Backend validates** token with Convex auth

### Authorization Patterns

#### Protected Routes

```typescript
// API route protection
export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Process request
}
```

#### Protected Convex Functions

```typescript
export const protectedQuery = query({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    // Process query
  },
});
```

#### Resource Ownership

```typescript
// Verify user owns resource
const analysis = await ctx.db.get(analysisId);
if (analysis.userId !== currentUserId) {
  throw new Error("Not authorized");
}
```

## Error Handling

### Error Response Format

All API responses follow a consistent error format:

```typescript
{
  "success": false,
  "error": {
    "code": "TRANSCRIPTION_FAILED",
    "message": "Failed to transcribe video audio",
    "context": {
      "videoUrl": "https://...",
      "duration": 30000
    }
  }
}
```

### Common Error Scenarios

1. **Invalid URL** - Malformed or unsupported URLs
2. **Authentication** - Missing or invalid tokens
3. **Rate Limiting** - Too many requests
4. **External API Failures** - OpenAI, Firecrawl timeouts
5. **Database Errors** - Convex operation failures

### Error Handling in Client Code

```typescript
try {
  const result = await analyzeVideo(url);
  setResult(result);
} catch (error) {
  if (error.code === "RATE_LIMITED") {
    showError("Please wait before analyzing another video");
  } else if (error.code === "INVALID_URL") {
    showError("Please enter a valid TikTok URL");
  } else {
    showError("Analysis failed. Please try again.");
  }
}
```

## Rate Limiting

### Limits

- **Analysis requests:** 10 per minute per user
- **General API calls:** 100 per 15 minutes per user
- **Fact-checking:** 5 per minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

```typescript
if (response.status === 429) {
  const resetTime = response.headers.get("X-RateLimit-Reset");
  const waitTime = parseInt(resetTime) * 1000 - Date.now();
  setTimeout(() => retryRequest(), waitTime);
}
```

## Real-time Updates

### Convex Subscriptions

Convex provides real-time subscriptions to data changes:

```typescript
// Automatically updates when data changes
const analyses = useQuery(api.tiktokAnalyses.getUserTikTokAnalyses);

// React component re-renders when new analysis is added
useEffect(() => {
  console.log("Analyses updated:", analyses?.length);
}, [analyses]);
```

### WebSocket Events

Real-time events for:

- New analysis completed
- Fact-check results updated
- Creator credibility changes
- User analysis statistics

## Performance Considerations

### Caching Strategy

1. **Browser Cache** - Static assets and API responses
2. **Convex Cache** - Automatic query result caching
3. **CDN Cache** - Global content delivery

### Optimization Tips

1. **Pagination** - Use cursor-based pagination for large datasets
2. **Selective Queries** - Only fetch required fields
3. **Debouncing** - Debounce search and input operations
4. **Lazy Loading** - Load components and data on demand

### Example: Paginated Queries

```typescript
const { data, loadMore, hasMore } = usePaginatedQuery(
  api.tiktokAnalyses.getAllAnalysesPaginated,
  { limit: 20 },
  { initialNumItems: 20 }
);
```

## Testing API Endpoints

### Development Testing

```bash
# Start local development
npx convex dev
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/@test/video/123"}'
```

### Integration Testing

```typescript
// Test Convex functions
import { convexTest } from "convex-test";
import { api } from "../convex/_generated/api";

test("should save analysis", async () => {
  const t = convexTest(schema);

  const analysisId = await t.mutation(api.tiktokAnalyses.saveTikTokAnalysis, {
    videoUrl: "https://test.com/video",
    transcription: { text: "Test content" },
    requiresFactCheck: false,
  });

  expect(analysisId).toBeDefined();
});
```

## API Versioning

### Current Version: v1

All endpoints are currently version 1. Future versions will be handled via:

1. **URL versioning** - `/api/v2/transcribe`
2. **Header versioning** - `API-Version: 2.0`
3. **Backward compatibility** - Maintain previous versions

### Migration Strategy

When introducing breaking changes:

1. Deploy new version alongside existing
2. Update client applications gradually
3. Deprecate old version with sufficient notice
4. Remove old version after migration period

This API guide provides comprehensive documentation for integrating with the Checkmate system. For implementation examples, refer to the [Hooks Guide](./HOOKS_GUIDE.md) and [Database Guide](./DATABASE_GUIDE.md).
