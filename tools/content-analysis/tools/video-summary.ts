import { tool } from "ai";
import { z } from "zod";
import { extractThemes } from "../helpers/themes";
import {
  extractKeyPoints,
  generateTakeaways,
  calculateEstimatedReadingTime,
  analyzeContentDepth,
  determineCreatorStyle,
} from "../helpers/content-utils";
import { analyzeEngagementElements } from "../helpers/engagement";

/**
 * Enhanced tool for generating intelligent video summaries with key insights.
 */
export const generateVideoSummary = tool({
  description:
    "Generate an intelligent summary of social media content with key points, themes, and actionable insights",
  parameters: z.object({
    title: z.string().describe("The content title or description"),
    transcription: z
      .string()
      .optional()
      .describe("The content transcription text"),
    metadata: z
      .object({
        creator: z.string(),
        contentType: z.enum(["video", "image_collection", "text", "audio"]),
        duration: z.number().optional(),
        platform: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
      })
      .describe("Content metadata"),
  }),
  execute: async ({ title, transcription, metadata }) => {
    try {
      const { creator, contentType, duration, platform, hashtags } = metadata;
      const fullText = [title, transcription].filter(Boolean).join(" ");

      if (!fullText.trim()) {
        return {
          success: false,
          error: "No content available for summary generation",
        };
      }

      // Enhanced title analysis
      const titleWords = title
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);
      const stopWords = [
        "the",
        "and",
        "for",
        "are",
        "but",
        "not",
        "you",
        "all",
        "can",
        "had",
        "her",
        "was",
        "one",
        "our",
        "out",
        "day",
        "get",
        "has",
        "him",
        "how",
        "man",
        "new",
        "now",
        "old",
        "see",
        "two",
        "way",
        "who",
        "its",
        "did",
        "yes",
        "his",
        "been",
        "have",
        "that",
        "this",
        "with",
        "from",
      ];

      const meaningfulWords = titleWords.filter(
        (word) => !stopWords.includes(word)
      );
      const mainTopic = meaningfulWords.slice(0, 3).join(" ") || "Content";

      const keyPoints = extractKeyPoints(transcription || "");
      const readingTime = calculateEstimatedReadingTime(transcription || "");
      const engagementAnalysis = analyzeEngagementElements(fullText);
      const creatorStyle = determineCreatorStyle(contentType, duration);

      const summary = {
        title_analysis: {
          main_topic: mainTopic,
          keywords: meaningfulWords.slice(0, 5),
          topic_category: extractThemes(title)[0] || "general",
        },
        content_summary: transcription
          ? {
              main_points:
                keyPoints.length > 0
                  ? keyPoints
                  : [fullText.substring(0, 100) + "..."],
              key_takeaways: generateTakeaways(fullText),
              estimated_reading_time: readingTime,
              word_count: transcription.split(/\s+/).length,
              content_depth: analyzeContentDepth(transcription),
            }
          : null,
        creator_info: {
          name: creator,
          content_style: creatorStyle,
          platform: platform || "unknown",
          specialization:
            extractThemes(fullText, title, hashtags)[0] || "general",
        },
        engagement_elements: engagementAnalysis,
        content_metrics: {
          has_hashtags: (hashtags?.length || 0) > 0,
          hashtag_count: hashtags?.length || 0,
          content_length:
            contentType === "video" && duration
              ? `${duration}s`
              : `${fullText.split(/\s+/).length} words`,
          accessibility_score: transcription ? "high" : "low",
        },
        recommendations: {
          for_viewers: [
            engagementAnalysis.educational_value
              ? "Good for learning new information"
              : "Entertainment focused content",
            readingTime > 2
              ? "Requires focused attention"
              : "Quick and easy to consume",
          ],
          for_creator: [
            !engagementAnalysis.has_call_to_action
              ? "Consider adding clear calls-to-action"
              : "Good use of engagement techniques",
            !transcription
              ? "Adding captions would improve accessibility"
              : "Well accessible with transcription",
          ],
        },
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate video summary",
      };
    }
  },
});
