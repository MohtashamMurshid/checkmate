import OpenAI from "openai";

/**
 * Evaluate domain credibility using LLM on a scale of 1-10
 */
export async function evaluateDomainCredibility(
  domain: string
): Promise<number> {
  if (!process.env.OPENAI_API_KEY) {
    // Default score for government and well-known educational domains
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
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.1,
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    const score = scoreText ? parseInt(scoreText) : 6;

    // Validate score is between 1-10
    return Math.max(1, Math.min(10, isNaN(score) ? 6 : score));
  } catch (error) {
    console.warn(`Failed to evaluate domain credibility for ${domain}:`, error);
    // Return default moderate score on error
    return 6;
  }
}
