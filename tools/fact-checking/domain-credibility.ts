import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * Evaluates domain credibility using AI analysis on a scale of 1-10.
 *
 * This function assesses the trustworthiness and reliability of a domain
 * for factual information and news content. It considers factors like:
 * - Editorial standards and fact-checking processes
 * - Reputation in journalism and academia
 * - Transparency about sources and methodology
 * - Track record of accuracy and bias
 *
 * Includes intelligent fallbacks for government/educational domains
 * when API is unavailable.
 *
 * @param domain - The domain name to evaluate (e.g., "reuters.com")
 * @returns Promise resolving to credibility score (1-10 scale)
 *
 * @example
 * ```typescript
 * const score = await evaluateDomainCredibility("reuters.com");
 * console.log(score); // 10 (extremely credible)
 *
 * const score2 = await evaluateDomainCredibility("cnn.com");
 * console.log(score2); // 8 (very credible)
 * ```
 */
export async function evaluateDomainCredibility(
  domain: string
): Promise<number> {
  if (!process.env.OPENAI_API_KEY) {
    /**
     * Fallback Credibility Assessment
     * When API is unavailable, uses domain-based heuristics to assign scores.
     * Prioritizes government and educational domains as highly credible.
     */
    if (
      domain.includes(".gov") ||
      domain.includes(".edu") ||
      domain.includes("who.int") ||
      domain.includes("nih.gov") ||
      domain.includes("cdc.gov")
    ) {
      return 9;
    }
    // Default moderate score if no API key
    return 6;
  }

  try {
    /**
     * AI-Powered Domain Credibility Analysis
     * Uses GPT to evaluate domain reputation and reliability based on
     * established journalism standards and credibility factors.
     */
    const prompt = `Evaluate the credibility of the domain "${domain}" for news and factual information on a scale of 1-10, where:
    
    10 = Extremely credible (e.g., Reuters, AP News, government agencies, peer-reviewed journals)
    9 = Highly credible (e.g., BBC, NPR, major fact-checking sites)
    8 = Very credible (e.g., established major newspapers)
    7 = Credible (e.g., well-known news outlets with good reputation)
    6 = Moderately credible (e.g., mainstream media with some bias)
    5 = Mixed credibility (e.g., sources with significant bias but some factual content)
    4 = Low credibility (e.g., tabloids, entertainment news)
    3 = Poor credibility (e.g., heavily biased sources)
    2 = Very poor credibility (e.g., conspiracy sites, satirical news)
    1 = Not credible (e.g., fake news sites, completely unreliable)
    
    Consider factors like:
    - Editorial standards and fact-checking processes
    - Reputation in journalism
    - Transparency about sources and methodology
    - Bias and agenda
    - Track record of accuracy
    
    Respond with ONLY a single number from 1-10.`;

    const { text: scoreText } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      maxTokens: 10,
      temperature: 0.1,
    });

    /**
     * Parse and Validate Credibility Score
     * Extracts numeric score from AI response and ensures it's within valid range.
     */
    const score = scoreText.trim() ? parseInt(scoreText.trim()) : 6;

    // Validate score is between 1-10
    return Math.max(1, Math.min(10, isNaN(score) ? 6 : score));
  } catch (error) {
    /**
     * Error Handling and Fallback
     * Logs errors for debugging while providing safe default score.
     */
    console.warn(`Failed to evaluate domain credibility for ${domain}:`, error);
    // Return default moderate score on error
    return 6;
  }
}
