/**
 * Content Analysis Module
 *
 * A comprehensive suite of tools for analyzing social media content including:
 * - Sentiment analysis
 * - Theme extraction
 * - Social media element extraction
 * - Content insights generation
 * - Video summarization
 * - Creator credibility rating
 */

// Import all tools
import { analyzeContentSentiment } from "./tools/sentiment-analysis";
import { extractHashtagsAndMentions } from "./tools/social-extraction";
import { generateContentInsights } from "./tools/content-insights";
import { generateVideoSummary } from "./tools/video-summary";
import { calculateCreatorCredibilityRating } from "./tools/credibility-rating";

// Import helper functions for direct use
export * from "./helpers/sentiment";
export * from "./helpers/themes";
export * from "./helpers/engagement";
export * from "./helpers/content-utils";

// Export individual tools
export {
  analyzeContentSentiment,
  extractHashtagsAndMentions,
  generateContentInsights,
  generateVideoSummary,
  calculateCreatorCredibilityRating,
};

// Export tools array for easy consumption
export const contentAnalysisTools = [
  analyzeContentSentiment,
  extractHashtagsAndMentions,
  generateContentInsights,
  generateVideoSummary,
  calculateCreatorCredibilityRating,
];

// Export types for better TypeScript support
export interface ContentAnalysisResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface AnalysisData {
  title: string;
  transcription?: string;
  creator: string;
  contentType: "video" | "image_collection" | "text" | "audio";
  hasAudio: boolean;
  platform?: string;
  hashtags?: string[];
}

export interface FactCheckResult {
  verdict?: string;
  confidence?: number;
  isVerified?: boolean;
}

export interface ContentMetadata {
  creator: string;
  platform: string;
  title?: string;
  hasTranscription: boolean;
  contentType?: string;
}

export interface AnalysisMetrics {
  hasNewsContent?: boolean;
  needsFactCheck?: boolean;
  contentLength?: number;
}
