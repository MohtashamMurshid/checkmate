import { tool } from "ai";
import { z } from "zod";

/**
 * Enhanced tool for extracting social media elements with better pattern recognition.
 */
export const extractHashtagsAndMentions = tool({
  description:
    "Extract hashtags, mentions, URLs, and other social media elements with enhanced pattern recognition",
  parameters: z.object({
    text: z
      .string()
      .describe(
        "The text content to analyze (title, description, transcription)"
      ),
  }),
  execute: async ({ text }) => {
    try {
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: "Text content is required for extraction",
        };
      }

      // Enhanced regex patterns
      const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
      const mentionRegex = /@[\w\u00C0-\u017F.]+/g;
      const urlRegex =
        /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/g;
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const phoneRegex =
        /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;

      const hashtags = [...(text.match(hashtagRegex) || [])];
      const mentions = [...(text.match(mentionRegex) || [])];
      const urls = [...(text.match(urlRegex) || [])];
      const emails = [...(text.match(emailRegex) || [])];
      const phones = [...(text.match(phoneRegex) || [])];

      // Extract trending hashtag indicators
      const trendingIndicators = hashtags.filter((tag) =>
        /(?:trending|viral|fyp|foryou|explore|popular)/i.test(tag)
      );

      // Analyze hashtag categories
      const hashtagCategories = {
        trending: hashtags.filter((tag) =>
          /(?:fyp|foryou|viral|trending)/i.test(tag)
        ),
        branded: hashtags.filter((tag) =>
          /(?:brand|sponsor|ad|promo)/i.test(tag)
        ),
        community: hashtags.filter((tag) =>
          /(?:community|family|friends|together)/i.test(tag)
        ),
        location: hashtags.filter((tag) =>
          /(?:city|country|place|location|nyc|la|london)/i.test(tag)
        ),
      };

      return {
        success: true,
        data: {
          hashtags,
          mentions,
          urls,
          emails,
          phones,
          hashtagCount: hashtags.length,
          mentionCount: mentions.length,
          urlCount: urls.length,
          emailCount: emails.length,
          phoneCount: phones.length,
          trendingIndicators,
          hashtagCategories,
          socialEngagement: {
            hasHashtags: hashtags.length > 0,
            hasMentions: mentions.length > 0,
            hasLinks: urls.length > 0,
            hasContact: emails.length > 0 || phones.length > 0,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract social media elements",
      };
    }
  },
});
