# React Hooks Guide

This guide covers all the custom React hooks available in the Checkmate project. These hooks provide type-safe interfaces to the Convex database and encapsulate common data operations.

## Overview

All hooks are located in the `lib/hooks/` directory and use Convex's React integration for real-time data synchronization. They follow consistent naming patterns and error handling.

## Hook Categories

### Analysis Hooks

#### `useAllAnalyses()`

**Location:** `lib/hooks/use-all-analyses.ts`

Retrieves all TikTok analyses across all users with real-time updates.

```typescript
import { useAllAnalyses } from '@/lib/hooks/use-all-analyses';

function AnalysesList() {
  const analyses = useAllAnalyses();

  if (analyses === undefined) return <Loading />;

  return (
    <div>
      {analyses.map(analysis => (
        <AnalysisCard key={analysis._id} analysis={analysis} />
      ))}
    </div>
  );
}
```

**Returns:** `Analysis[] | undefined`

- `undefined` when loading
- Array of analysis objects when loaded

#### `useAllAnalysisStats()`

**Location:** `lib/hooks/use-all-analyses.ts`

Provides aggregated statistics across all analyses.

```typescript
const stats = useAllAnalysisStats();
// Returns: { totalAnalyses, verifiedTrue, verifiedFalse, etc. }
```

### User-Specific Analysis Hooks

#### `useUserTikTokAnalyses()`

**Location:** `lib/hooks/use-saved-analyses.ts`

Retrieves TikTok analyses for the currently authenticated user.

```typescript
import { useUserTikTokAnalyses } from '@/lib/hooks/use-saved-analyses';

function MyAnalyses() {
  const userAnalyses = useUserTikTokAnalyses();

  return (
    <div>
      <h2>My Analyses ({userAnalyses?.length || 0})</h2>
      {userAnalyses?.map(analysis => (
        <AnalysisCard key={analysis._id} analysis={analysis} />
      ))}
    </div>
  );
}
```

#### `useTikTokAnalysisById(analysisId)`

**Location:** `lib/hooks/use-saved-analyses.ts`

Retrieves a specific analysis by its ID.

```typescript
const analysis = useTikTokAnalysisById("j57abc123..." as Id<"tiktokAnalyses">);
```

**Parameters:**

- `analysisId: Id<"tiktokAnalyses">` - The unique analysis identifier

### Fact-Checking Hooks

#### `useAnalysesRequiringFactCheck(limit?)`

**Location:** `lib/hooks/use-saved-analyses.ts`

Retrieves analyses that have been flagged as requiring fact-checking.

```typescript
const pendingFactChecks = useAnalysesRequiringFactCheck(10);
```

**Parameters:**

- `limit?: number` - Maximum number of analyses to return

### User Statistics Hooks

#### `useUserAnalysisStats()`

**Location:** `lib/hooks/use-saved-analyses.ts`

Provides statistics for the current user's analyses.

```typescript
const userStats = useUserAnalysisStats();
// Returns: { totalAnalyses, verifiedCount, unverifiedCount, etc. }
```

### Mutation Hooks

#### `useDeleteTikTokAnalysis()`

**Location:** `lib/hooks/use-saved-analyses.ts`

Provides a function to delete a TikTok analysis.

```typescript
const deleteAnalysis = useDeleteTikTokAnalysis();

const handleDelete = async (analysisId: Id<"tiktokAnalyses">) => {
  try {
    await deleteAnalysis({ analysisId });
    console.log("Analysis deleted successfully");
  } catch (error) {
    console.error("Failed to delete analysis:", error);
  }
};
```

#### `useSaveTikTokAnalysis()`

**Location:** `lib/hooks/use-saved-analyses.ts`

Saves a new TikTok analysis to the database.

```typescript
const saveAnalysis = useSaveTikTokAnalysis();

const handleSave = async (analysisData) => {
  try {
    const result = await saveAnalysis(analysisData);
    console.log("Analysis saved:", result);
  } catch (error) {
    console.error("Failed to save analysis:", error);
  }
};
```

#### `useSaveTikTokAnalysisWithCredibility()`

**Location:** `lib/hooks/use-saved-analyses.ts`

Saves a TikTok analysis with credibility rating information.

```typescript
const saveWithCredibility = useSaveTikTokAnalysisWithCredibility();
```

### Creator-Related Hooks

#### `useContentCreator(creatorId, platform)`

**Location:** `lib/hooks/use-saved-analyses.ts`

Retrieves information about a specific content creator.

```typescript
const creator = useContentCreator("@username", "tiktok");
```

**Parameters:**

- `creatorId: string` - The creator's unique identifier
- `platform: string` - The platform (e.g., "tiktok", "twitter")

#### `useTopCreatorsByCredibility(platform?, limit?)`

**Location:** `lib/hooks/use-saved-analyses.ts`

Retrieves top content creators ranked by credibility.

```typescript
const topCreators = useTopCreatorsByCredibility("tiktok", 10);
```

**Parameters:**

- `platform?: string` - Filter by platform (optional)
- `limit?: number` - Maximum number of creators to return

### Credible Sources Hooks

#### `useCredibleSources()`

**Location:** `lib/hooks/use-credible-sources.ts`

Retrieves credible news sources for the news analysis feature.

```typescript
import { useCredibleSources } from "@/lib/hooks/use-credible-sources";

const { topCredible, topMisinformation } = useCredibleSources();
```

### Analysis Processing Hook

#### `useTikTokAnalysis()`

**Location:** `lib/hooks/use-tiktok-analysis.ts`

Provides functionality to analyze TikTok videos, including transcription and fact-checking.

```typescript
import { useTikTokAnalysis } from '@/lib/hooks/use-tiktok-analysis';

function AnalysisForm() {
  const { analyzeVideo, isLoading, progress, error } = useTikTokAnalysis();

  const handleAnalyze = async (url: string) => {
    try {
      const result = await analyzeVideo(url);
      console.log('Analysis complete:', result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      {isLoading && <Progress value={progress} />}
      {error && <ErrorMessage error={error} />}
      <button onClick={() => handleAnalyze(videoUrl)}>
        Analyze Video
      </button>
    </div>
  );
}
```

**Returns:**

- `analyzeVideo: (url: string) => Promise<AnalysisResult>`
- `isLoading: boolean`
- `progress: number` (0-100)
- `error: string | null`

## Hook Usage Patterns

### Loading States

All query hooks return `undefined` when loading:

```typescript
const data = useQuery(/*...*/);

if (data === undefined) {
  return <LoadingSpinner />;
}

// Data is loaded
return <DataComponent data={data} />;
```

### Error Handling

Convex hooks throw errors that can be caught with error boundaries:

```typescript
function AnalysisComponent() {
  try {
    const analyses = useUserTikTokAnalyses();
    return <AnalysesList analyses={analyses} />;
  } catch (error) {
    return <ErrorMessage error={error} />;
  }
}
```

### Optimistic Updates

Mutation hooks support optimistic updates:

```typescript
const deleteAnalysis = useDeleteTikTokAnalysis();

const handleDelete = async (id) => {
  // Optimistically update UI
  setAnalyses((prev) => prev.filter((a) => a._id !== id));

  try {
    await deleteAnalysis({ analysisId: id });
  } catch (error) {
    // Revert optimistic update
    refetchAnalyses();
    showError("Delete failed");
  }
};
```

## Type Safety

All hooks are fully typed with TypeScript. Import types from the generated Convex types:

```typescript
import { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";

type Analysis = Doc<"tiktokAnalyses">;
type AnalysisId = Id<"tiktokAnalyses">;
```

## Best Practices

1. **Always handle loading states** - Query hooks return `undefined` while loading
2. **Use error boundaries** - Wrap components that use hooks in error boundaries
3. **Implement optimistic updates** - For better UX in mutation operations
4. **Memoize expensive operations** - Use `useMemo` for computed values
5. **Batch related operations** - Group related mutations when possible

## Common Patterns

### Conditional Data Loading

```typescript
function ConditionalAnalysis({ shouldLoad, analysisId }) {
  const analysis = useTikTokAnalysisById(
    shouldLoad ? analysisId : undefined
  );

  if (!shouldLoad) return null;
  if (analysis === undefined) return <Loading />;

  return <AnalysisDetails analysis={analysis} />;
}
```

### Data Transformation

```typescript
function AnalysisStats() {
  const analyses = useUserTikTokAnalyses();

  const stats = useMemo(() => {
    if (!analyses) return null;

    return {
      total: analyses.length,
      verified: analyses.filter(a => a.factCheck?.verdict === 'verified').length,
      pending: analyses.filter(a => a.requiresFactCheck).length,
    };
  }, [analyses]);

  if (!stats) return <Loading />;

  return <StatsDisplay stats={stats} />;
}
```

This guide should help you understand and effectively use the custom hooks in the Checkmate project. For more details on specific implementations, refer to the individual hook files in `lib/hooks/`.
