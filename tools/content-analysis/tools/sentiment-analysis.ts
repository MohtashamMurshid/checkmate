import { tool } from "ai";
import { z } from "zod";
import {
  calculateSentimentScore,
  extractEmotions,
  determineOverallSentiment,
  calculateSentimentConfidence,
} from "../helpers/sentiment";
import {
  extractThemes,
  categorizeContent,
  extractKeywords,
} from "../helpers/themes";
import {
  assessEngagementPotential,
  calculateReadabilityScore,
} from "../helpers/engagement";
import { generateIntelligentSummary } from "../helpers/content-utils";

/**
 * Enhanced tool for analyzing the sentiment and themes of social media content.
 */
export const analyzeContentSentiment = tool({
  description:
    "Analyze the sentiment, themes, and emotional tone of social media content with enhanced AI-like analysis",
  parameters: z.object({
    text: z.string().describe("The transcribed text to analyze"),
    title: z.string().optional().describe("The video title or description"),
    hashtags: z
      .array(z.string())
      .optional()
      .describe("Array of hashtags from the content"),
  }),
  execute: async ({ text, title, hashtags }) => {
    try {
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: "Text content is required for sentiment analysis",
        };
      }

      const sentimentScore = calculateSentimentScore(text);
      const themes = extractThemes(text, title, hashtags);
      const engagement = assessEngagementPotential(text, hashtags);
      const keywords = extractKeywords(text);
      const emotions = extractEmotions(text);
      const overallSentiment = determineOverallSentiment(sentimentScore);
      const confidence = calculateSentimentConfidence(sentimentScore);
      const summary = generateIntelligentSummary(text);
      const contentCategory = categorizeContent(themes);
      const readabilityScore = calculateReadabilityScore(text);

      const analysis = {
        sentiment: {
          overall: overallSentiment,
          score: sentimentScore,
          confidence,
          emotions,
        },
        themes,
        topics: hashtags || [],
        keywords,
        summary,
        engagement_potential: engagement.level,
        engagement_score: engagement.score,
        engagement_factors: engagement.factors,
        content_category: contentCategory,
        word_count: text.split(/\s+/).length,
        readability_score: readabilityScore,
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze content sentiment",
      };
    }
  },
});
