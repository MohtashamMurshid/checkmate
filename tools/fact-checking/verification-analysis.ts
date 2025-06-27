import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * Analyzes verification status and confidence using LLM with comprehensive fact-check analysis.
 *
 * This function takes a claim and supporting research content, then uses AI to determine:
 * - Verification status (verified/misleading/unverifiable)
 * - Confidence level (0.0 to 1.0)
 *
 * The function includes intelligent fallbacks for when API keys are unavailable,
 * using keyword-based analysis as a backup method.
 *
 * @param claim - The original claim or content to be verified
 * @param searchContent - Research content and evidence from credible sources
 * @returns Promise resolving to verification status and confidence score
 *
 * @example
 * ```typescript
 * const result = await analyzeVerificationStatus(
 *   "Vaccines cause autism in children",
 *   "CDC research shows no link between vaccines and autism..."
 * );
 *
 * console.log(result.status); // "misleading"
 * console.log(result.confidence); // 0.85
 * ```
 */
export async function analyzeVerificationStatus(
  claim: string,
  searchContent: string
): Promise<{ status: string; confidence: number }> {
  if (!process.env.OPENAI_API_KEY) {
    /**
     * Fallback Analysis: Keyword-Based Assessment
     * When API is unavailable, uses basic keyword matching to determine status.
     * This provides a basic level of analysis even without AI capabilities.
     */
    const lowercaseContent = searchContent.toLowerCase();
    let status = "unverifiable";
    let confidence = 0.5;

    if (
      lowercaseContent.includes("verified") ||
      lowercaseContent.includes("confirmed") ||
      lowercaseContent.includes("accurate")
    ) {
      status = "verified";
      confidence = 0.7;
    } else if (lowercaseContent.includes("misleading")) {
      status = "misleading";
      confidence = 0.7;
    } else if (lowercaseContent.includes("unverifiable")) {
      status = "unverifiable";
      confidence = 0.6;
    }

    return { status, confidence };
  }

  try {
    /**
     * AI-Powered Verification Analysis
     * Uses GPT to analyze research content and determine verification status
     * with high accuracy and nuanced understanding of context.
     */
    const prompt = `Analyze the following fact-check research results for the claim: "${claim}"

Research Results:
${searchContent}

Based on the research evidence, determine:
1. Verification Status: Choose ONE of: "verified", "misleading", "unverifiable"
2. Confidence Level: A number from 0.0 to 1.0 representing how confident you are in this assessment

Guidelines:
- "verified": Clear evidence supports the claim and it is accurate
- "misleading": Claim has some truth but lacks important context or is presented in a misleading way
- "unverifiable": Insufficient credible evidence to make a determination

Respond in this exact JSON format:
{"status": "status_here", "confidence": 0.0}`;

    const { text: responseText } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      maxTokens: 100,
      temperature: 0.1,
    });

    try {
      /**
       * Parse AI Response and Extract Verification Data
       * Attempts to parse JSON response and validates the results.
       */
      const parsed = JSON.parse(responseText.trim() || "{}");
      const status = parsed.status || "unverifiable";
      const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

      return { status, confidence };
    } catch {
      /**
       * JSON Parsing Fallback
       * If AI response isn't valid JSON, return safe defaults.
       */
      return { status: "unverifiable", confidence: 0.5 };
    }
  } catch (error) {
    /**
     * Error Handling and Logging
     * Logs errors for debugging while providing safe fallback response.
     */
    console.warn(`Failed to analyze verification status for claim:`, error);
    return { status: "unverifiable", confidence: 0.5 };
  }
}
