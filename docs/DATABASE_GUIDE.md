# Database Guide (Convex)

This guide covers the database architecture, schema design, and operations used in the Checkmate project. The project uses [Convex](https://convex.dev/) as its backend database and real-time sync solution.

## Overview

Convex is a serverless backend that provides:

- Real-time database with automatic sync
- Type-safe operations
- Built-in authentication integration
- Automatic schema validation

## Database Schema

The schema is defined in `convex/schema.ts` and includes four main tables:

### Tables Overview

```typescript
// Core tables
users; // User accounts (synced from Clerk)
contentCreators; // Content creator credibility tracking
tiktokAnalyses; // Analysis results for TikTok videos
creatorComments; // User comments about creators
```

### 1. Users Table

**Purpose:** Stores user account information synced from Clerk authentication.

```typescript
users: {
  clerkId: string,           // Unique Clerk user identifier
  email: string,             // User email address
  firstName?: string,        // User's first name
  lastName?: string,         // User's last name
  imageUrl?: string,         // Profile image URL
  username?: string,         // Username
  createdAt: number,         // Account creation timestamp
  updatedAt: number,         // Last update timestamp
}
```

**Indexes:**

- `by_clerk_id` - For looking up users by Clerk ID

**Usage Example:**

```typescript
// Get current user
const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
  .unique();
```

### 2. Content Creators Table

**Purpose:** Tracks credibility metrics for content creators across platforms.

```typescript
contentCreators: {
  creatorId: string,              // Platform-specific creator ID (@username)
  platform: string,              // Platform name ("tiktok", "twitter", etc.)
  creatorName?: string,           // Display name
  credibilityRating: number,      // 0-10 weighted average rating
  totalAnalyses: number,          // Number of analyses performed
  totalCredibilityScore: number,  // Sum of all ratings (for weighted avg)
  lastAnalyzedAt: number,         // Last analysis timestamp
  createdAt: number,              // Creator record creation
  updatedAt: number,              // Last update timestamp
}
```

**Indexes:**

- `by_creator_platform` - Find creator by ID and platform
- `by_platform` - Filter creators by platform
- `by_credibility_rating` - Sort creators by credibility
- `by_last_analyzed` - Sort by recent analysis activity

**Usage Example:**

```typescript
// Get top credible TikTok creators
const topCreators = await ctx.db
  .query("contentCreators")
  .withIndex("by_platform", (q) => q.eq("platform", "tiktok"))
  .filter((q) => q.gte(q.field("credibilityRating"), 7.0))
  .order("desc")
  .take(10);
```

### 3. TikTok Analyses Table

**Purpose:** Stores complete analysis results for TikTok videos including transcription, fact-checking, and metadata.

```typescript
tiktokAnalyses: {
  userId: Id<"users">,              // Reference to user who created analysis
  videoUrl: string,                 // Original TikTok video URL

  // Transcription data
  transcription?: {
    text: string,                   // Transcribed text content
    duration?: number,              // Video duration in seconds
    language?: string,              // Detected language
  },

  // Video metadata
  metadata?: {
    title: string,                  // Video title
    description?: string,           // Video description
    creator?: string,               // Creator username/ID
    originalUrl: string,            // Original video URL
    contentType?: string,           // Type of content
    platform?: string,             // Platform identifier
  },

  // News detection results
  newsDetection?: {
    hasNewsContent: boolean,        // Whether news content was detected
    confidence: number,             // Detection confidence (0-1)
    newsKeywordsFound: string[],    // News-related keywords found
    potentialClaims: string[],      // Claims that could be fact-checked
    needsFactCheck: boolean,        // Whether fact-checking is needed
    contentType: string,            // Type of news content
  },

  // Fact-checking results
  factCheck?: {
    verdict?: string,               // "verified", "true", "false", "misleading", "unverifiable"
    confidence?: number,            // Confidence percentage (0-100)
    explanation?: string,           // Detailed analysis explanation
    content?: string,               // Content summary
    isVerified?: boolean,           // Whether verification was successful
    sources?: Array<{              // Supporting sources
      title: string,
      url: string,
      source?: string,
      relevance?: number,
    }>,
    error?: string,                 // Error message if fact-check failed

    // Legacy fields for backward compatibility
    totalClaims?: number,
    checkedClaims?: number,
    results?: Array<{
      claim: string,
      status: string,
      confidence: number,
      analysis?: string,
      sources: string[],
      error?: string,
    }>,
    summary?: {
      verifiedTrue: number,
      verifiedFalse: number,
      misleading: number,
      unverifiable: number,
      needsVerification: number,
    },
  },

  // Creator credibility for this analysis
  creatorCredibilityRating?: number,     // 0-10 rating for this specific analysis
  contentCreatorId?: Id<"contentCreators">, // Reference to content creator

  // Analysis flags
  requiresFactCheck: boolean,            // Whether this analysis needs fact-checking

  createdAt: number,                     // Analysis creation timestamp
}
```

**Indexes:**

- `by_user` - Get analyses by user
- `by_requires_fact_check` - Filter analyses needing fact-checking
- `by_user_and_platform` - Filter user analyses by platform
- `by_content_creator` - Get analyses for specific creator

**Usage Example:**

```typescript
// Get user's analyses requiring fact-check
const pendingAnalyses = await ctx.db
  .query("tiktokAnalyses")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .filter((q) => q.eq(q.field("requiresFactCheck"), true))
  .collect();
```

### 4. Creator Comments Table

**Purpose:** Stores user comments and feedback about content creators.

```typescript
creatorComments: {
  creatorId: string,          // Creator's platform-specific ID
  platform: string,          // Platform name
  userId: Id<"users">,       // User who posted the comment
  content: string,           // Comment text content
  createdAt: number,         // Comment creation timestamp
  updatedAt: number,         // Last update timestamp
}
```

**Indexes:**

- `by_creator_platform` - Get comments for specific creator
- `by_user` - Get comments by user
- `by_created_at` - Sort comments chronologically

## Database Operations

### Queries vs Mutations

**Queries** - Read-only operations that can be called from the client:

```typescript
export const getAnalyses = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
```

**Mutations** - Write operations that modify the database:

```typescript
export const createAnalysis = mutation({
  args: {
    videoUrl: v.string(),
    transcription: v.object({
      /* ... */
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("tiktokAnalyses", {
      userId: identity.subject,
      videoUrl: args.videoUrl,
      // ... other fields
    });
  },
});
```

### Common Query Patterns

#### 1. Simple Lookups

```typescript
// Get single document by ID
const analysis = await ctx.db.get(analysisId);

// Get user by Clerk ID
const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
  .unique();
```

#### 2. Filtered Queries

```typescript
// Get analyses requiring fact-check
const pending = await ctx.db
  .query("tiktokAnalyses")
  .filter((q) => q.eq(q.field("requiresFactCheck"), true))
  .take(limit);

// Get credible creators
const credibleCreators = await ctx.db
  .query("contentCreators")
  .filter((q) => q.gte(q.field("credibilityRating"), 7.0))
  .collect();
```

#### 3. Ordered Results

```typescript
// Get recent analyses
const recentAnalyses = await ctx.db
  .query("tiktokAnalyses")
  .order("desc") // Order by _creationTime
  .take(10);

// Get top creators by credibility
const topCreators = await ctx.db
  .query("contentCreators")
  .withIndex("by_credibility_rating")
  .order("desc")
  .take(5);
```

#### 4. Pagination

```typescript
// Paginated query with cursor
export const getAnalysesPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    let q = ctx.db.query("tiktokAnalyses").order("desc");

    if (args.cursor) {
      q = q.filter((q) =>
        q.lt(q.field("_creationTime"), parseInt(args.cursor))
      );
    }

    const results = await q.take(limit + 1);
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore
      ? items[items.length - 1]._creationTime.toString()
      : null;

    return { items, hasMore, nextCursor };
  },
});
```

### Common Mutation Patterns

#### 1. Create Operations

```typescript
// Create new analysis
const analysisId = await ctx.db.insert("tiktokAnalyses", {
  userId: identity.subject,
  videoUrl: args.videoUrl,
  requiresFactCheck: false,
  createdAt: Date.now(),
});
```

#### 2. Update Operations

```typescript
// Update existing analysis
await ctx.db.patch(analysisId, {
  factCheck: args.factCheckResults,
  updatedAt: Date.now(),
});
```

#### 3. Conditional Updates

```typescript
// Update creator credibility with weighted average
const creator = await ctx.db.get(creatorId);
if (creator) {
  const newTotal = creator.totalAnalyses + 1;
  const newScore = creator.totalCredibilityScore + newRating;
  const newAverage = newScore / newTotal;

  await ctx.db.patch(creatorId, {
    credibilityRating: Math.round(newAverage * 10) / 10,
    totalAnalyses: newTotal,
    totalCredibilityScore: newScore,
    updatedAt: Date.now(),
  });
}
```

#### 4. Delete Operations

```typescript
// Delete analysis
await ctx.db.delete(analysisId);

// Conditional delete
const analysis = await ctx.db.get(analysisId);
if (analysis && analysis.userId === currentUserId) {
  await ctx.db.delete(analysisId);
}
```

## Authentication & Authorization

### User Authentication

Convex integrates with Clerk for authentication:

```typescript
export const protectedMutation = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // identity.subject contains the Clerk user ID
    const user = await getCurrentUser(ctx, identity.subject);
    // ... protected operation
  },
});
```

### Authorization Patterns

#### 1. User-Scoped Operations

```typescript
// Only allow users to access their own data
export const getUserAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("tiktokAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
```

#### 2. Resource Ownership Checks

```typescript
// Verify user owns the resource before modification
export const deleteAnalysis = mutation({
  args: { analysisId: v.id("tiktokAnalyses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) throw new Error("Analysis not found");

    if (analysis.userId !== identity.subject) {
      throw new Error("Not authorized to delete this analysis");
    }

    await ctx.db.delete(args.analysisId);
  },
});
```

## Performance Considerations

### Indexing Strategy

1. **Query Performance** - Always use indexes for filtered queries
2. **Index Design** - Create composite indexes for multi-field queries
3. **Sort Optimization** - Use indexed fields for ordering when possible

```typescript
// Good: Uses index
.withIndex("by_user", q => q.eq("userId", userId))

// Avoid: Full table scan
.filter(q => q.eq(q.field("userId"), userId))
```

### Query Optimization

1. **Limit Results** - Always use `.take(n)` for large datasets
2. **Early Filtering** - Apply filters before sorting when possible
3. **Selective Fields** - Only fetch needed fields for large objects

```typescript
// Efficient pagination
const results = await ctx.db
  .query("tiktokAnalyses")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .filter((q) => q.eq(q.field("requiresFactCheck"), true))
  .order("desc")
  .take(20);
```

## Error Handling

### Common Error Patterns

```typescript
export const safeOperation = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.videoUrl) {
        throw new Error("Video URL is required");
      }

      // Check authentication
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Authentication required");
      }

      // Verify resource exists
      const resource = await ctx.db.get(args.resourceId);
      if (!resource) {
        throw new Error("Resource not found");
      }

      // Perform operation
      return await ctx.db.insert(/* ... */);
    } catch (error) {
      // Log error for debugging
      console.error("Operation failed:", error);
      throw error; // Re-throw for client handling
    }
  },
});
```

## Development Workflow

### 1. Schema Changes

```bash
# After modifying schema.ts
npx convex dev  # Regenerates types and pushes schema
```

### 2. Testing Database Operations

```bash
# Run Convex functions locally
npx convex dev

# Test functions in Convex dashboard
open https://dashboard.convex.dev
```

### 3. Data Migration

```typescript
// Create migration functions for schema changes
export const migrateAnalyses = internalMutation({
  handler: async (ctx) => {
    const analyses = await ctx.db.query("tiktokAnalyses").collect();

    for (const analysis of analyses) {
      if (!analysis.requiresFactCheck) {
        await ctx.db.patch(analysis._id, {
          requiresFactCheck: false, // Add missing field
        });
      }
    }
  },
});
```

## Best Practices

1. **Type Safety** - Always use generated types from `_generated/dataModel`
2. **Index Usage** - Use appropriate indexes for all filtered queries
3. **Error Handling** - Provide meaningful error messages
4. **Authentication** - Verify user identity in all protected operations
5. **Data Validation** - Validate inputs using Convex validators (`v.string()`, etc.)
6. **Performance** - Limit query results and use pagination for large datasets
7. **Consistency** - Follow established patterns for naming and structure

This guide provides a comprehensive overview of the database layer in the Checkmate project. For more specific implementation details, refer to the files in the `convex/` directory.
