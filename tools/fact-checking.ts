import { tool } from "ai";
import { z } from "zod";
import OpenAI from "openai";

/**
 * Evaluate domain credibility using LLM on a scale of 1-10
 */
async function evaluateDomainCredibility(domain: string): Promise<number> {
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

/**
 * Analyze verification status and confidence using LLM
 */
async function analyzeVerificationStatus(
  claim: string,
  searchContent: string
): Promise<{ status: string; confidence: number }> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to basic keyword analysis if no API key
    const lowercaseContent = searchContent.toLowerCase();
    let status = "requires_verification";
    let confidence = 0.5;

    if (
      lowercaseContent.includes("true") ||
      lowercaseContent.includes("verified")
    ) {
      status = "true";
      confidence = 0.7;
    } else if (
      lowercaseContent.includes("false") ||
      lowercaseContent.includes("debunked")
    ) {
      status = "false";
      confidence = 0.8;
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
1. Verification Status: Choose ONE of: "true", "false", "misleading", "unverifiable", "requires_verification"
2. Confidence Level: A number from 0.0 to 1.0 representing how confident you are in this assessment
Guidelines:
- "true": Clear evidence supports the claim
- "false": Clear evidence contradicts the claim  
- "misleading": Claim has some truth but lacks important context or is presented in a misleading way
- "unverifiable": Insufficient credible evidence to make a determination
- "requires_verification": More investigation needed

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
      const status = parsed.status || "requires_verification";
      const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

      return { status, confidence };
    } catch {
      // Fallback if JSON parsing fails
      return { status: "requires_verification", confidence: 0.5 };
    }
  } catch (error) {
    console.warn(`Failed to analyze verification status for claim:`, error);
    return { status: "requires_verification", confidence: 0.5 };
  }
}

/**
 * Tool to determine whether the transcription content contains news or factual claims that need verification.
 * @type {import("ai").Tool}
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

/**
 * Tool to search the web using OpenAI's web search to validate key claims from the transcription with fact-checking sources.
 * @type {import("ai").Tool}
 */
export const researchAndFactCheck = tool({
  description:
    "Search the web using OpenAI's web search to validate key claims from the transcription with fact-checking sources",
  parameters: z.object({
    claims: z.array(z.string()).describe("Array of factual claims to verify"),
    context: z
      .string()
      .optional()
      .describe("Additional context about the video content"),
  }),
  execute: async ({ claims, context }) => {
    const factCheckResults = [];

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    // Use context for enhanced search if provided
    const searchContext = context ? ` Context: ${context}` : "";

    for (const claim of claims.slice(0, 3)) {
      // Limit to 3 claims to avoid rate limits
      try {
        // Create a comprehensive fact-checking query
        const factCheckQuery = `Fact-check this claim with credible sources: "${claim}". 
        ${searchContext}
        
        Please provide:
        1. Verification status (true/false/misleading/unverifiable)
        2. Evidence from credible sources
        3. List credible fact-checking websites and news sources
        4. Include URLs when possible
        5. Explain any nuances or context`;

        // Create OpenAI client and use Responses API with web search
        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await client.responses.create({
          model: "gpt-4o-mini",
          tools: [
            {
              type: "web_search_preview",
            },
          ],
          input: factCheckQuery,
        });

        // Extract the text content from the response
        let searchContent = "";
        const extractedSources: Array<{
          title: string;
          url: string;
          source: string;
          relevance: number;
          description: string;
        }> = [];

        // Process the response output according to the official API structure
        if (response.output && Array.isArray(response.output)) {
          for (const outputItem of response.output) {
            if (outputItem.type === "message" && outputItem.content) {
              for (const contentItem of outputItem.content) {
                if (contentItem.type === "output_text") {
                  searchContent += contentItem.text || "";

                  // Extract citations from annotations
                  if (
                    contentItem.annotations &&
                    Array.isArray(contentItem.annotations)
                  ) {
                    for (const annotation of contentItem.annotations) {
                      if (
                        annotation.type === "url_citation" &&
                        annotation.url
                      ) {
                        try {
                          const hostname = new URL(annotation.url).hostname;

                          // Use LLM to evaluate domain credibility
                          const credibilityScore =
                            await evaluateDomainCredibility(hostname);
                          const relevance = credibilityScore / 10;
                          const isHighlyCredible = credibilityScore >= 8;

                          extractedSources.push({
                            title:
                              annotation.title ||
                              `${isHighlyCredible ? "Credible Source" : "Web Source"} from ${hostname}`,
                            url: annotation.url,
                            source: hostname,
                            relevance: relevance,
                            description: isHighlyCredible
                              ? "Credible news/fact-checking source from web search"
                              : "Web source found in search results",
                          });
                        } catch (error) {
                          console.warn(
                            "Failed to process citation URL:",
                            annotation.url,
                            error
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Fallback: Extract URLs from response content if no annotations found
        if (extractedSources.length === 0 && searchContent) {
          const urlMatches =
            searchContent.match(/https?:\/\/[^\s\)\]\,\;]+/g) || [];
          const uniqueUrls = new Set();

          for (const url of urlMatches) {
            const cleanUrl = url.replace(/[.,;)\]]+$/, "");

            if (!uniqueUrls.has(cleanUrl)) {
              try {
                const hostname = new URL(cleanUrl).hostname;
                const credibilityScore =
                  await evaluateDomainCredibility(hostname);
                const relevance = credibilityScore / 10;
                const isHighlyCredible = credibilityScore >= 8;

                extractedSources.push({
                  title: `${isHighlyCredible ? "Credible Source" : "Web Source"} from ${hostname}`,
                  url: cleanUrl,
                  source: hostname,
                  relevance: relevance,
                  description: isHighlyCredible
                    ? "Credible news/fact-checking source"
                    : "Web source found in search results",
                });

                uniqueUrls.add(cleanUrl);
              } catch {
                console.warn("Invalid URL found:", cleanUrl);
              }
            }
          }
        }

        // Sort sources by relevance (credible sources first)
        extractedSources.sort((a, b) => b.relevance - a.relevance);

        // Use LLM to analyze the verification status and confidence
        const { status, confidence } = await analyzeVerificationStatus(
          claim,
          searchContent
        );

        // Extract key terms from the claim for additional context
        const searchTerms = claim
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(" ")
          .filter((word) => word.length > 3)
          .slice(0, 5)
          .join(" ");

        const factCheckResult = {
          claim: claim,
          searchTerms: searchTerms,
          status: status,
          confidence: confidence,
          webSearchAnalysis: {
            summary:
              searchContent.substring(0, 500) +
              (searchContent.length > 500 ? "..." : ""),
            fullAnalysis: searchContent,
            sourcesFound: extractedSources.length,
            webSourcesUsed: extractedSources.length > 0,
            primarySources: extractedSources.slice(0, 3).map((source) => ({
              title: source.title,
              url: source.url,
              source: source.source,
            })),
          },
          sources: extractedSources,
          keyTopics: searchTerms.split(" "),
          needsManualVerification: false,
        };

        factCheckResults.push(factCheckResult);
      } catch (error) {
        factCheckResults.push({
          claim: claim,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to research this claim",
          confidence: 0,
          sources: [],
          keyTopics: [],
          needsManualVerification: true,
        });
      }
    }

    return {
      success: true,
      data: {
        totalClaims: claims.length,
        checkedClaims: factCheckResults.length,
        results: factCheckResults,
        summary: {
          verifiedTrue: factCheckResults.filter((r) => r.status === "true")
            .length,
          verifiedFalse: factCheckResults.filter((r) => r.status === "false")
            .length,
          misleading: factCheckResults.filter((r) => r.status === "misleading")
            .length,
          unverifiable: factCheckResults.filter(
            (r) => r.status === "unverifiable"
          ).length,
          needsVerification: factCheckResults.filter(
            (r) => r.status === "requires_verification"
          ).length,
        },
        recommendedSources: [],
      },
    };
  },
});

/**
 * Tool to generate a comprehensive credibility report with main claims, verification status, and sources.
 * @type {import("ai").Tool}
 */
export const generateCredibilityReport = tool({
  description:
    "Generate a comprehensive credibility report with main claims, verification status, and sources",
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
        potentialClaims: z.array(z.string()),
        contentType: z.string(),
      })
      .describe("News detection results"),
    factCheckResults: z
      .object({
        results: z.array(
          z.object({
            claim: z.string(),
            status: z.string(),
            confidence: z.number(),
            sources: z.array(
              z.object({
                title: z.string(),
                url: z.string(),
                source: z.string(),
                relevance: z.number(),
              })
            ),
          })
        ),
        summary: z.object({
          verifiedTrue: z.number(),
          verifiedFalse: z.number(),
          misleading: z.number(),
          unverifiable: z.number(),
          needsVerification: z.number(),
        }),
      })
      .describe("Fact-check results"),
  }),
  execute: async ({ videoData, newsDetection, factCheckResults }) => {
    // Calculate overall credibility score
    const totalClaims = factCheckResults.results.length;
    const verifiedClaims = factCheckResults.summary.verifiedTrue;
    const falseClaims = factCheckResults.summary.verifiedFalse;
    const misleadingClaims = factCheckResults.summary.misleading;

    let credibilityScore = 0.5; // Default neutral score

    if (totalClaims > 0) {
      const positiveScore = (verifiedClaims / totalClaims) * 100;
      const negativeScore =
        ((falseClaims + misleadingClaims) / totalClaims) * 100;
      credibilityScore =
        Math.max(0, Math.min(100, positiveScore - negativeScore)) / 100;
    }

    // Generate credibility level
    let credibilityLevel = "Unknown";
    if (credibilityScore >= 0.8) credibilityLevel = "High";
    else if (credibilityScore >= 0.6) credibilityLevel = "Medium-High";
    else if (credibilityScore >= 0.4) credibilityLevel = "Medium";
    else if (credibilityScore >= 0.2) credibilityLevel = "Low-Medium";
    else credibilityLevel = "Low";

    // Collect all unique sources
    const allSources = factCheckResults.results
      .flatMap((result) => result.sources)
      .filter(
        (source, index, self) =>
          index === self.findIndex((s) => s.url === source.url)
      )
      .sort((a, b) => b.relevance - a.relevance);

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
      },
      claimsAnalysis: {
        totalClaims: newsDetection.potentialClaims.length,
        analyzedClaims: totalClaims,
        verificationSummary: factCheckResults.summary,
        detailedResults: factCheckResults.results.map((result) => ({
          claim: result.claim,
          verificationStatus: result.status,
          confidence: result.confidence,
          topSources: result.sources.slice(0, 2), // Top 2 sources per claim
        })),
      },
      sources: {
        total: allSources.length,
        credibleSources: allSources.filter((s) => s.relevance > 0.7),
        allSources: allSources,
      },
      recommendations: [
        newsDetection.hasNewsContent
          ? "This content contains factual claims that should be verified with credible sources."
          : "This content appears to be primarily entertainment or opinion-based.",
        totalClaims > 0
          ? "Cross-reference the highlighted claims with the provided fact-checking sources."
          : "No specific factual claims were identified for verification.",
        "Always verify information from multiple credible sources before sharing.",
      ],
      flags: {
        requiresFactCheck: newsDetection.hasNewsContent,
        hasUnverifiedClaims: factCheckResults.summary.needsVerification > 0,
        hasMisleadingContent: factCheckResults.summary.misleading > 0,
        hasFalseContent: factCheckResults.summary.verifiedFalse > 0,
      },
    };

    return {
      success: true,
      data: report,
    };
  },
});

/**
 * Array of fact-checking tools for easy use.
 * @type {import("ai").Tool[]}
 */
export const factCheckingTools = [
  detectNewsContent,
  researchAndFactCheck,
  generateCredibilityReport,
];
