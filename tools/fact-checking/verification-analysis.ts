import OpenAI from "openai";

/**
 * Analyze verification status and confidence using LLM
 */
export async function analyzeVerificationStatus(
  claim: string,
  searchContent: string
): Promise<{ status: string; confidence: number }> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to basic keyword analysis if no API key
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
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Analyze the following fact-check research results for the claim: "${claim}"

Research Results:

Based on the research evidence, determine:
1. Verification Status: Choose ONE of: "verified", "misleading", "unverifiable"
2. Confidence Level: A number from 0.0 to 1.0 representing how confident you are in this assessment

Guidelines:
- "verified": Clear evidence supports the claim and it is accurate
- "misleading": Claim has some truth but lacks important context or is presented in a misleading way
- "unverifiable": Insufficient credible evidence to make a determination

Respond in this exact JSON format:
{"status": "status_here", "confidence": 0.0}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.1,
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    try {
      const parsed = JSON.parse(responseText || "{}");
      const status = parsed.status || "unverifiable";
      const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

      return { status, confidence };
    } catch {
      // Fallback if JSON parsing fails
      return { status: "unverifiable", confidence: 0.5 };
    }
  } catch (error) {
    console.warn(`Failed to analyze verification status for claim:`, error);
    return { status: "unverifiable", confidence: 0.5 };
  }
}
