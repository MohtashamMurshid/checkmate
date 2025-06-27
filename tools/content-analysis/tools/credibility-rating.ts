import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for calculating a content creator's credibility rating (0-10) based on analysis results.
 */
export const calculateCreatorCredibilityRating = tool({
  description:
    "Calculate a content creator's credibility rating (0-10) based on fact-check results, content quality, and other factors",
  parameters: z.object({
    factCheckResult: z
      .object({
        verdict: z.string().optional(), // "true", "false", "misleading", "unverifiable"
        confidence: z.number().optional(), // 0-100
        isVerified: z.boolean().optional(),
      })
      .optional(),
    contentMetadata: z.object({
      creator: z.string(),
      platform: z.string(),
      title: z.string().optional(),
      hasTranscription: z.boolean(),
      contentType: z.string().optional(),
    }),
    analysisMetrics: z
      .object({
        hasNewsContent: z.boolean().optional(),
        needsFactCheck: z.boolean().optional(),
        contentLength: z.number().optional(), // Length of transcription/content
      })
      .optional(),
  }),
  execute: async ({ factCheckResult, contentMetadata, analysisMetrics }) => {
    try {
      let credibilityScore = 5.0; // Start with neutral rating
      const factors = [];

      // Factor 1: Fact-check verdict (most important factor)
      if (factCheckResult) {
        const { verdict, confidence, isVerified } = factCheckResult;

        if (isVerified && verdict) {
          switch (verdict.toLowerCase()) {
            case "true":
            case "verified":
              credibilityScore += 3.0;
              factors.push("Content verified as true (+3.0)");
              break;
            case "false":
            case "misleading":
              credibilityScore -= 4.0;
              factors.push("Content flagged as false/misleading (-4.0)");
              break;
            case "unverifiable":
              credibilityScore -= 1.0;
              factors.push("Content unverifiable (-1.0)");
              break;
          }

          // Confidence modifier
          if (confidence && confidence > 0) {
            const confidenceModifier = ((confidence - 50) / 100) * 1.0; // -0.5 to +0.5
            credibilityScore += confidenceModifier;
            factors.push(
              `Confidence modifier: ${confidenceModifier.toFixed(2)}`
            );
          }
        } else {
          // If fact-check failed but attempted
          credibilityScore -= 0.5;
          factors.push("Fact-check attempted but failed (-0.5)");
        }
      }

      // Factor 2: Content quality indicators
      if (contentMetadata.hasTranscription) {
        credibilityScore += 0.5;
        factors.push("Has transcription/clear content (+0.5)");
      }

      // Factor 3: News content handling
      if (analysisMetrics?.hasNewsContent) {
        if (analysisMetrics.needsFactCheck && factCheckResult?.isVerified) {
          credibilityScore += 1.0;
          factors.push("News content properly fact-checked (+1.0)");
        } else if (
          analysisMetrics.needsFactCheck &&
          !factCheckResult?.isVerified
        ) {
          credibilityScore -= 1.5;
          factors.push("News content not properly verified (-1.5)");
        }
      }

      // Factor 4: Content length/substance
      if (analysisMetrics?.contentLength) {
        if (analysisMetrics.contentLength > 100) {
          credibilityScore += 0.5;
          factors.push("Substantial content length (+0.5)");
        } else if (analysisMetrics.contentLength < 20) {
          credibilityScore -= 0.5;
          factors.push("Very short content (-0.5)");
        }
      }

      // Factor 5: Platform-specific modifiers
      switch (contentMetadata.platform.toLowerCase()) {
        case "twitter":
        case "x":
          // Twitter content is often shorter and more opinion-based
          credibilityScore -= 0.2;
          factors.push("Twitter platform modifier (-0.2)");
          break;
        case "tiktok":
          // TikTok content varies widely
          credibilityScore += 0.1;
          factors.push("TikTok platform modifier (+0.1)");
          break;
      }

      // Ensure rating stays within 0-10 bounds
      credibilityScore = Math.max(0, Math.min(10, credibilityScore));

      return {
        success: true,
        data: {
          credibilityRating: Math.round(credibilityScore * 10) / 10, // Round to 1 decimal
          rawScore: credibilityScore,
          factors,
          explanation: `Creator credibility rating: ${credibilityScore.toFixed(1)}/10 based on ${factors.length} factors`,
          creator: contentMetadata.creator,
          platform: contentMetadata.platform,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate credibility rating",
      };
    }
  },
});
