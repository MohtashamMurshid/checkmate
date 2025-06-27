import { tool } from "ai";
import { z } from "zod";
import { extractThemes } from "../helpers/themes";

/**
 * Enhanced tool for generating comprehensive content insights and actionable recommendations.
 */
export const generateContentInsights = tool({
  description:
    "Generate comprehensive insights and actionable recommendations based on social media content analysis",
  parameters: z.object({
    analysisData: z
      .object({
        title: z.string(),
        transcription: z.string().optional(),
        contentType: z.enum(["video", "image_collection", "text", "audio"]),
        hasAudio: z.boolean(),
        platform: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
      })
      .describe("The complete analysis data from social media content"),
  }),
  execute: async ({ analysisData }) => {
    try {
      const {
        title,
        transcription,
        contentType,
        hasAudio,
        platform,
        hashtags,
      } = analysisData;

      const fullText = [title, transcription].filter(Boolean).join(" ");
      const wordCount = fullText.split(/\s+/).length;

      // Content quality scoring
      let qualityScore = 5.0; // Base score out of 10
      const qualityFactors: string[] = [];

      if (hasAudio && contentType === "video") {
        qualityScore += 1.0;
        qualityFactors.push("Has audio content (+1.0)");
      }

      if (transcription && transcription.length > 50) {
        qualityScore += 1.5;
        qualityFactors.push("Has substantial transcription (+1.5)");
      }

      if (hashtags && hashtags.length > 0 && hashtags.length <= 10) {
        qualityScore += 1.0;
        qualityFactors.push("Appropriate hashtag usage (+1.0)");
      } else if (hashtags && hashtags.length > 10) {
        qualityScore -= 0.5;
        qualityFactors.push("Too many hashtags (-0.5)");
      }

      if (wordCount > 20 && wordCount < 300) {
        qualityScore += 0.5;
        qualityFactors.push("Optimal content length (+0.5)");
      }

      // Viral potential calculation
      let viralScore = 0.3; // Base viral potential
      const viralFactors: string[] = [];

      if (hashtags?.some((tag) => /(?:fyp|foryou|viral|trending)/i.test(tag))) {
        viralScore += 0.2;
        viralFactors.push("Uses trending hashtags");
      }

      if (/\b(challenge|trend|viral|popular)\b/gi.test(fullText)) {
        viralScore += 0.15;
        viralFactors.push("References viral trends");
      }

      if (contentType === "video" && hasAudio) {
        viralScore += 0.1;
        viralFactors.push("Video with audio");
      }

      if (/[?!]/.test(fullText)) {
        viralScore += 0.05;
        viralFactors.push("Engaging punctuation");
      }

      // Generate recommendations
      const recommendations: string[] = [];

      if (!transcription && contentType === "video") {
        recommendations.push(
          "Add captions or transcription for better accessibility and SEO"
        );
      }

      if (!hashtags || hashtags.length === 0) {
        recommendations.push(
          "Include relevant hashtags to increase discoverability"
        );
      }

      if (hashtags && hashtags.length > 15) {
        recommendations.push(
          "Reduce number of hashtags to focus on most relevant ones"
        );
      }

      if (wordCount < 20) {
        recommendations.push(
          "Consider adding more descriptive content to improve engagement"
        );
      }

      if (!/[?]/.test(fullText)) {
        recommendations.push(
          "Consider adding questions to encourage viewer interaction"
        );
      }

      if (platform === "tiktok" && !hashtags?.some((tag) => /fyp/i.test(tag))) {
        recommendations.push(
          "Consider using #fyp or #foryou for TikTok algorithm visibility"
        );
      }

      // Accessibility assessment
      const accessibilityScore = (() => {
        let score = 0;
        if (transcription) score += 4;
        if (hasAudio) score += 3;
        if (title && title.length > 10) score += 2;
        if (contentType === "video" && transcription) score += 1;
        return Math.min(score, 10);
      })();

      const insights = {
        content_quality: {
          score: Math.min(Math.max(qualityScore, 0), 10),
          factors: qualityFactors,
          rating:
            qualityScore >= 7 ? "high" : qualityScore >= 5 ? "medium" : "low",
        },
        viral_potential: {
          score: Math.min(Math.max(viralScore, 0), 1),
          percentage: Math.round(viralScore * 100),
          factors: viralFactors,
          rating:
            viralScore >= 0.7 ? "high" : viralScore >= 0.4 ? "medium" : "low",
        },
        accessibility: {
          score: accessibilityScore,
          has_captions: !!transcription,
          has_audio: hasAudio,
          has_description: title.length > 10,
          rating:
            accessibilityScore >= 7
              ? "excellent"
              : accessibilityScore >= 5
                ? "good"
                : "needs_improvement",
          recommendations: transcription
            ? ["Content is well accessible with transcription"]
            : ["Add captions or transcription for better accessibility"],
        },
        engagement_optimization: {
          estimated_reach:
            viralScore > 0.6 ? "high" : viralScore > 0.3 ? "medium" : "limited",
          best_posting_times:
            platform === "tiktok" ? ["6-10am", "7-9pm"] : ["12-3pm", "5-7pm"],
          target_audience: extractThemes(fullText, title, hashtags).includes(
            "educational"
          )
            ? "18-34"
            : "16-28",
        },
        recommendations,
        overall_score: Math.round(
          ((qualityScore / 10 + viralScore + accessibilityScore / 10) / 3) * 100
        ),
      };

      return {
        success: true,
        data: insights,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate content insights",
      };
    }
  },
});
