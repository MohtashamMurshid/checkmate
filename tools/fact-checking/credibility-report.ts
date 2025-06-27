import { tool } from "ai";
import { z } from "zod";

/**
 * Tool to generate a comprehensive credibility report with verification status and sources.
 */
export const generateCredibilityReport = tool({
  description:
    "Generate a comprehensive credibility report with verification status and sources",
  parameters: z.object({
    videoData: z
      .object({
        title: z.string(),
        creator: z.string(),
        transcription: z.string(),
      })
      .describe("Original video data"),
    newsDetection: z
      .object({
        hasNewsContent: z.boolean(),
        contentType: z.string(),
      })
      .describe("News detection results"),
    factCheckResults: z
      .object({
        overallStatus: z.string(),
        confidence: z.number(),
        isVerified: z.boolean(),
        isMisleading: z.boolean(),
        isUnverifiable: z.boolean(),
        sources: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            source: z.string(),
            relevance: z.number(),
          })
        ),
        credibleSourcesCount: z.number(),
        reasoning: z.string(),
      })
      .describe("Fact-check results"),
  }),
  execute: async ({ videoData, newsDetection, factCheckResults }) => {
    // Calculate overall credibility score based on verification status
    let credibilityScore = 0.5; // Default neutral score

    if (factCheckResults.isVerified) {
      credibilityScore = 0.8 + factCheckResults.confidence * 0.2;
    } else if (factCheckResults.isMisleading) {
      credibilityScore = 0.3 + factCheckResults.confidence * 0.2;
    } else if (factCheckResults.isUnverifiable) {
      credibilityScore = 0.5;
    }

    // Ensure score is within bounds
    credibilityScore = Math.max(0, Math.min(1, credibilityScore));

    // Generate credibility level
    let credibilityLevel = "Unknown";
    if (credibilityScore >= 0.8) credibilityLevel = "High";
    else if (credibilityScore >= 0.6) credibilityLevel = "Medium-High";
    else if (credibilityScore >= 0.4) credibilityLevel = "Medium";
    else if (credibilityScore >= 0.2) credibilityLevel = "Low-Medium";
    else credibilityLevel = "Low";

    const report = {
      videoInfo: {
        title: videoData.title,
        creator: videoData.creator,
        analysisDate: new Date().toISOString(),
      },
      credibilityAssessment: {
        overallScore: credibilityScore,
        level: credibilityLevel,
        hasFactualContent: newsDetection.hasNewsContent,
        contentType: newsDetection.contentType,
        verificationStatus: factCheckResults.overallStatus,
        confidence: factCheckResults.confidence,
      },
      verificationResult: {
        status: factCheckResults.overallStatus,
        isVerified: factCheckResults.isVerified,
        isMisleading: factCheckResults.isMisleading,
        isUnverifiable: factCheckResults.isUnverifiable,
        reasoning: factCheckResults.reasoning,
      },
      sources: {
        total: factCheckResults.sources.length,
        credibleSources: factCheckResults.sources.filter(
          (s) => s.relevance > 0.7
        ),
        credibleSourcesCount: factCheckResults.credibleSourcesCount,
        allSources: factCheckResults.sources.sort(
          (a, b) => b.relevance - a.relevance
        ),
      },
      recommendations: [
        newsDetection.hasNewsContent
          ? "This content contains factual information that was verified against credible sources."
          : "This content appears to be primarily entertainment or opinion-based.",
        factCheckResults.sources.length > 0
          ? "Review the provided sources to understand the verification process."
          : "Limited sources were found for verification.",
        "Always verify information from multiple credible sources before sharing.",
      ],
      flags: {
        requiresFactCheck: newsDetection.hasNewsContent,
        isVerified: factCheckResults.isVerified,
        isMisleadingContent: factCheckResults.isMisleading,
        needsMoreVerification: factCheckResults.isUnverifiable,
        hasCredibleSources: factCheckResults.credibleSourcesCount > 0,
      },
    };

    return {
      success: true,
      data: report,
    };
  },
});
