import { tool } from "ai";
import { z } from "zod";

/**
 * Tool to determine whether the transcription content contains news or factual claims that need verification.
 */
export const detectNewsContent = tool({
  description:
    "Determine whether the transcription content contains news or factual claims that need verification",
  parameters: z.object({
    transcription: z
      .string()
      .describe("The transcribed text from the TikTok video"),
    title: z.string().optional().describe("The video title or description"),
  }),
  execute: async ({ transcription, title }) => {
    // Keywords and patterns that indicate news/factual content
    const newsKeywords = [
      "breaking news",
      "reports say",
      "according to",
      "study shows",
      "research finds",
      "scientists say",
      "experts claim",
      "government announces",
      "official statement",
      "investigation reveals",
      "data shows",
      "statistics indicate",
      "poll results",
      "survey finds",
      "analysis reveals",
      "studies suggest",
      "research indicates",
      "confirmed cases",
      "deaths reported",
      "economy",
      "inflation",
      "election",
      "politician",
      "president",
      "mayor",
      "governor",
      "congress",
      "senate",
      "health officials",
      "cdc says",
      "who reports",
      "fda approves",
      "leaked documents",
      "new study",
      "new research",
      "new data",
      "new statistics",
      "new poll",
      "new survey",
      "new report",
      "new analysis",
      "new findings",
      "new evidence",
      "new study",
      "new research",
      "new data",
      "new statistics",
    ];

    const factualClaimPatterns = [
      /\d+%/g, // Percentages
      /\$[\d,]+/g, // Money amounts
      /\d+,?\d*\s+(people|deaths|cases|millions|billions|thousands)/gi, // Numbers with units
      /(increase|decrease|rise|fall|drop).*\d+/gi, // Change statistics
      /(studies?|research|data|statistics|polls?|surveys?)/gi, // Research references
    ];

    const combinedText = `${title || ""} ${transcription}`.toLowerCase();

    // Check for news keywords
    const foundNewsKeywords = newsKeywords.filter((keyword) =>
      combinedText.includes(keyword.toLowerCase())
    );

    // Check for factual claim patterns
    const foundFactualPatterns = factualClaimPatterns
      .map((pattern) => {
        const matches = combinedText.match(pattern);
        return matches ? matches.length : 0;
      })
      .reduce((sum, count) => sum + count, 0);

    // Determine if content contains news/claims
    const hasNewsContent =
      foundNewsKeywords.length > 0 || foundFactualPatterns > 0;

    // Extract potential claims for fact-checking
    const potentialClaims = [];

    // Split into sentences and identify claim-like statements
    const sentences = transcription
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      // Check if sentence contains factual indicators
      const hasFactualIndicators =
        newsKeywords.some((keyword) =>
          lowerSentence.includes(keyword.toLowerCase())
        ) || factualClaimPatterns.some((pattern) => pattern.test(sentence));

      if (hasFactualIndicators) {
        potentialClaims.push(sentence.trim());
      }
    }

    return {
      success: true,
      data: {
        hasNewsContent,
        confidence: hasNewsContent ? 0.8 : 0.2,
        newsKeywordsFound: foundNewsKeywords,
        factualPatternsCount: foundFactualPatterns,
        potentialClaims: potentialClaims.slice(0, 5), // Limit to top 5 claims
        needsFactCheck: hasNewsContent,
        contentType: hasNewsContent ? "news_factual" : "entertainment_opinion",
      },
    };
  },
});
