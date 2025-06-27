# Content Analysis Module

A comprehensive, modular suite of tools for analyzing social media content including sentiment analysis, theme extraction, content insights, and more.

## 🏗️ Architecture

The content analysis module has been refactored into a clean, modular structure:

```
tools/content-analysis/
├── helpers/
│   ├── sentiment.ts         # Sentiment analysis utilities
│   ├── themes.ts           # Theme extraction utilities
│   ├── engagement.ts       # Engagement assessment utilities
│   └── content-utils.ts    # General content utilities
├── tools/
│   ├── sentiment-analysis.ts    # Sentiment analysis tool
│   ├── social-extraction.ts     # Social media element extraction
│   ├── content-insights.ts      # Content insights generation
│   ├── video-summary.ts         # Video summarization
│   └── credibility-rating.ts    # Creator credibility assessment
├── index.ts                # Main export file
└── README.md              # This file
```

## 📦 Usage

### Import Everything

```typescript
import { contentAnalysisTools } from "./tools/content-analysis/index.js";

// Or import everything
import * as ContentAnalysis from "./tools/content-analysis/index.js";
```

### Import Individual Tools

```typescript
import { analyzeContentSentiment } from "./tools/content-analysis/tools/sentiment-analysis.js";
import { extractHashtagsAndMentions } from "./tools/content-analysis/tools/social-extraction.js";
```

### Import Helper Functions

```typescript
import {
  calculateSentimentScore,
  extractEmotions,
} from "./tools/content-analysis/helpers/sentiment.js";
import {
  extractThemes,
  categorizeContent,
} from "./tools/content-analysis/helpers/themes.js";
```

### Backward Compatibility

```typescript
// This still works for existing code
import { contentAnalysisTools } from "./tools/content-analysis.js";
```

## 🛠️ Available Tools

### 1. Sentiment Analysis (`analyzeContentSentiment`)

Analyzes sentiment, emotions, and themes of social media content.

**Parameters:**

- `text`: Content text to analyze
- `title?`: Optional title/description
- `hashtags?`: Optional array of hashtags

**Returns:** Sentiment score, emotions, themes, engagement metrics

### 2. Social Element Extraction (`extractHashtagsAndMentions`)

Extracts hashtags, mentions, URLs, emails, and phone numbers.

**Parameters:**

- `text`: Content text to analyze

**Returns:** Categorized social media elements and engagement indicators

### 3. Content Insights (`generateContentInsights`)

Generates comprehensive insights and recommendations.

**Parameters:**

- `analysisData`: Object with title, transcription, content type, audio status, platform, hashtags

**Returns:** Quality scores, viral potential, accessibility assessment, recommendations

### 4. Video Summary (`generateVideoSummary`)

Creates intelligent summaries with key points and takeaways.

**Parameters:**

- `title`: Content title
- `transcription?`: Optional transcription
- `metadata`: Creator info, content type, duration, platform, hashtags

**Returns:** Structured summary with key points, engagement analysis, recommendations

### 5. Credibility Rating (`calculateCreatorCredibilityRating`)

Calculates creator credibility based on fact-checking and content quality.

**Parameters:**

- `factCheckResult?`: Optional fact-check results
- `contentMetadata`: Creator and content information
- `analysisMetrics?`: Optional analysis metrics

**Returns:** Credibility score (0-10), contributing factors, explanation

## 🔧 Helper Functions

### Sentiment Helpers

- `calculateSentimentScore(text)`: Returns sentiment score (-1 to 1)
- `extractEmotions(text)`: Extracts emotions from text
- `determineOverallSentiment(score)`: Converts score to category
- `calculateSentimentConfidence(score)`: Returns confidence level

### Theme Helpers

- `extractThemes(text, title?, hashtags?)`: Extracts content themes
- `categorizeContent(themes)`: Categorizes content type
- `extractKeywords(text)`: Extracts top keywords

### Engagement Helpers

- `assessEngagementPotential(text, hashtags?)`: Assesses viral potential
- `analyzeEngagementElements(text)`: Analyzes engagement indicators
- `calculateReadabilityScore(text)`: Calculates readability

### Content Utilities

- `generateIntelligentSummary(text)`: Creates smart summary
- `extractKeyPoints(text)`: Extracts important sentences
- `generateTakeaways(text)`: Creates key takeaways
- `calculateEstimatedReadingTime(text)`: Estimates reading time
- `analyzeContentDepth(text)`: Analyzes content depth
- `determineCreatorStyle(type, duration?)`: Determines creator style

## 🎯 Benefits of Modularization

1. **Better Organization**: Logical separation of concerns
2. **Easier Maintenance**: Smaller, focused files
3. **Improved Reusability**: Import only what you need
4. **Better Testing**: Test individual components
5. **Clearer Dependencies**: Explicit imports show relationships
6. **Type Safety**: Better TypeScript support
7. **Performance**: Tree-shaking and selective imports

## 🔄 Migration Guide

### Before (Monolithic)

```typescript
import { contentAnalysisTools } from "./tools/content-analysis.js";
// All 1000+ lines loaded regardless of usage
```

### After (Modular)

```typescript
// Import everything (if needed)
import { contentAnalysisTools } from "./tools/content-analysis/index.js";

// Or import only what you need
import { analyzeContentSentiment } from "./tools/content-analysis/tools/sentiment-analysis.js";
import { calculateSentimentScore } from "./tools/content-analysis/helpers/sentiment.js";
```

## 📄 License

This module is part of the Checkmate project and follows the same license terms.
