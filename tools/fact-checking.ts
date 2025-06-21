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
 * Tool to search the web using OpenAI's web search to verify content and determine truthfulness.
 * @type {import("ai").Tool}
 */
export const researchAndFactCheck = tool({
  description:
    "Search the web using OpenAI's web search to verify content and determine if it's verified, misleading, or unverifiable",
  parameters: z.object({
    transcription: z.string().describe("The transcribed content to verify"),
    title: z.string().optional().describe("The video title for context"),
    context: z
      .string()
      .optional()
      .describe("Additional context about the video content"),
  }),
  execute: async ({ transcription, title, context }) => {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    try {
      // Create a comprehensive fact-checking query
      const contentToCheck = `${title ? `Title: ${title}\n` : ""}Content: ${transcription}`;
      const searchContext = context ? ` Context: ${context}` : "";

      const factCheckQuery = `Fact-check and verify this content with credible sources as of ${new Date().toLocaleDateString()}, and provide the most recent information: 
      
      ${contentToCheck}
      ${searchContext}
      
      Please provide:
      1. Overall verification status (verified/misleading/unverifiable)
      2. Evidence from credible sources
      3. Credible fact-checking websites and news sources
      4. Include URLs when possible
      5. Explain the reasoning behind your assessment
      
      Format it with conclusion and summary first, then Accurate Information, then Misleading Information, then the sources as 1 section and reasoning. Highlight biases and sources that are not credible with tags.`;

      // Create OpenAI client and use Responses API with web search
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
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
                    if (annotation.type === "url_citation" && annotation.url) {
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

      // Use LLM to analyze the verification status and confidence for the overall content
      const { status, confidence } = await analyzeVerificationStatus(
        transcription,
        searchContent
      );

      return {
        success: true,
        data: {
          overallStatus: status,
          confidence: confidence,
          isVerified: status === "verified",
          isMisleading: status === "misleading",
          isUnverifiable: status === "unverifiable",
          webSearchAnalysis: {
            summary:
              searchContent.substring(0, 500) +
              (searchContent.length > 500 ? "..." : ""),
            fullAnalysis: searchContent,
            sourcesFound: extractedSources.length,
            webSourcesUsed: extractedSources.length > 0,
            primarySources: extractedSources.slice(0, 5).map((source) => ({
              title: source.title,
              url: source.url,
              source: source.source,
            })),
          },
          sources: extractedSources,
          credibleSourcesCount: extractedSources.filter(
            (s) => s.relevance > 0.7
          ).length,
          reasoning: searchContent,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to verify content",
        data: {
          overallStatus: "unverifiable",
          confidence: 0,
          isVerified: false,
          isMisleading: false,
          isUnverifiable: true,
          sources: [],
          credibleSourcesCount: 0,
          reasoning: "Error occurred during verification",
        },
      };
    }
  },
});

/**
 * Tool to generate a comprehensive credibility report with verification status and sources.
 * @type {import("ai").Tool}
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

/**
 * Array of fact-checking tools for easy use.
 * @type {import("ai").Tool[]}
 */
export const factCheckingTools = [
  detectNewsContent,
  researchAndFactCheck,
  generateCredibilityReport,
];
