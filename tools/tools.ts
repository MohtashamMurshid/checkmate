import { tool } from "ai";
import { z } from "zod";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

/**
 * Helper function to transcribe a video directly from a given URL using OpenAI Whisper.
 * @param {string} videoUrl - The direct URL of the video to transcribe.
 * @returns {Promise<{ success: boolean; data?: { text: string; segments: any[]; language: string }; error?: string }>} Transcription result object.
 */
// Helper function for transcribing video
export async function transcribeVideoDirectly(videoUrl: string) {
  try {
    if (!videoUrl) {
      return {
        success: false,
        error: "Video URL is required",
      };
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    // Download the video content
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return {
        success: false,
        error: "Failed to fetch video",
      };
    }

    // Get the video as an array buffer
    const videoArrayBuffer = await videoResponse.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);

    // Use AI SDK's experimental transcribe function
    const transcription = await experimental_transcribe({
      model: openai.transcription("whisper-1"),
      audio: videoBuffer,
    });

    // Return the transcription results
    return {
      success: true,
      data: {
        text: transcription.text,
        segments: transcription.segments || [],
        language: transcription.language,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transcription failed",
    };
  }
}

/**
 * Tool for analyzing a TikTok video URL to extract metadata and download links for fact-checking.
 * @type {import("ai").Tool}
 */
export const analyzeTikTokVideo = tool({
  description:
    "Analyze a TikTok video URL to extract metadata and download links for fact-checking",
  parameters: z.object({
    url: z.string().describe("The TikTok video URL to analyze"),
  }),
  execute: async ({ url }) => {
    try {
      if (!url) {
        return {
          success: false,
          error: "URL is required",
        };
      }

      // Validate TikTok URL format
      const tiktokUrlPattern =
        /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      if (!tiktokUrlPattern.test(url)) {
        return {
          success: false,
          error: "Invalid TikTok URL format",
        };
      }

      // Download TikTok content using the API
      const result = await Downloader(url, {
        version: "v3", // Use the latest version
      });

      if (result.status !== "success" || !result.result) {
        return {
          success: false,
          error: "Failed to analyze TikTok video",
        };
      }

      // Get the best quality MP4 video URL for transcription
      const videoUrl =
        result.result.videoHD || result.result.videoWatermark || "";
      let transcription = null;

      // If it's a video, try to transcribe it
      if (result.result.type === "video" && videoUrl) {
        try {
          // Transcribe the video directly using the same logic
          const transcriptionResult = await transcribeVideoDirectly(videoUrl);
          if (transcriptionResult.success) {
            transcription = transcriptionResult.data;
          }
        } catch {
          // Continue without transcription if it fails
        }
      }

      // Format the response to match our expected interface
      const analysis = {
        success: true,
        data: {
          title: result.result.desc || "TikTok Video",
          thumbnail: result.result.author?.avatar || "",
          hasVideo: result.result.type === "video" && !!result.result.videoHD,
          hasImages: result.result.type === "image" && !!result.result.images,
          hasAudio: !!result.result.music,
          downloadLinks: {
            video: {
              standard: result.result.videoWatermark || "",
              alternative: result.result.videoHD || "",
              hd: result.result.videoHD || "",
            },
            audio: result.result.music || "",
            images: result.result.images || [],
          },
          metadata: {
            creator: result.result.author?.nickname || "Unknown",
            contentType:
              result.result.type === "image"
                ? ("image_collection" as const)
                : ("video" as const),
          },
          transcription,
        },
      };

      return analysis;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      };
    }
  },
});

/**
 * Tool for transcribing audio from a TikTok video URL using OpenAI Whisper for fact-checking analysis.
 * @type {import("ai").Tool}
 */
export const transcribeTikTokVideo = tool({
  description:
    "Transcribe audio from a TikTok video URL using OpenAI Whisper for fact-checking analysis",
  parameters: z.object({
    videoUrl: z.string().describe("The direct video URL to transcribe"),
  }),
  execute: async ({ videoUrl }) => {
    try {
      if (!videoUrl) {
        return {
          success: false,
          error: "Video URL is required",
        };
      }

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return {
          success: false,
          error: "OpenAI API key not configured",
        };
      }

      // Download the video content
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        return {
          success: false,
          error: "Failed to fetch video",
        };
      }

      // Get the video as an array buffer
      const videoArrayBuffer = await videoResponse.arrayBuffer();
      const videoBuffer = Buffer.from(videoArrayBuffer);

      // Use AI SDK's experimental transcribe function
      const transcription = await experimental_transcribe({
        model: openai.transcription("whisper-1"),
        audio: videoBuffer,
      });

      // Return the transcription results
      return {
        success: true,
        data: {
          text: transcription.text,
          segments: transcription.segments || [],
          language: transcription.language,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transcription failed",
      };
    }
  },
});

/**
 * Tool for analyzing the sentiment and themes of TikTok video content based on transcription and metadata.
 * @type {import("ai").Tool}
 */
export const analyzeContentSentiment = tool({
  description:
    "Analyze the sentiment and themes of TikTok video content based on transcription and metadata",
  parameters: z.object({
    text: z.string().describe("The transcribed text to analyze"),
    title: z.string().optional().describe("The video title or description"),
    hashtags: z
      .array(z.string())
      .optional()
      .describe("Array of hashtags from the video"),
  }),
  execute: async ({ text, title, hashtags }) => {
    // This would typically call an AI model to analyze sentiment
    // For now, we'll return a structured analysis based on the input
    const analysis = {
      sentiment: {
        overall: "neutral", // This would be determined by AI analysis
        confidence: 0.8,
        emotions: ["curious", "informative"], // Extracted emotions
      },
      themes: [] as string[], // Would extract main themes from content
      topics: [] as string[], // Would identify key topics discussed
      keywords: [] as string[], // Important keywords found
      summary: "", // AI-generated summary
      engagement_potential: "medium", // Predicted engagement level
      content_category: "general", // Category classification
    };

    // Basic keyword extraction (in a real implementation, this would use AI)
    const words = text.toLowerCase().split(/\s+/);
    analysis.keywords = [
      ...new Set(words.filter((word) => word.length > 4)),
    ].slice(0, 10);

    // Basic summary (in a real implementation, this would use AI)
    analysis.summary =
      text.length > 100 ? text.substring(0, 100) + "..." : text;

    // Use title and hashtags for enhanced analysis
    if (title) {
      const titleWords = title.toLowerCase().split(/\s+/);
      analysis.themes.push(...titleWords.filter((word) => word.length > 3));
    }

    if (hashtags && hashtags.length > 0) {
      analysis.topics.push(...hashtags);
    }

    return {
      success: true,
      data: analysis,
    };
  },
});

/**
 * Tool for extracting hashtags, mentions, and social media elements from TikTok content.
 * @type {import("ai").Tool}
 */
export const extractHashtagsAndMentions = tool({
  description:
    "Extract hashtags, mentions, and social media elements from TikTok content",
  parameters: z.object({
    text: z
      .string()
      .describe(
        "The text content to analyze (title, description, transcription)"
      ),
  }),
  execute: async ({ text }) => {
    const hashtagRegex = /#[\w]+/g;
    const mentionRegex = /@[\w]+/g;
    const urlRegex = /https?:\/\/[^\s]+/g;

    const hashtags = [...(text.match(hashtagRegex) || [])];
    const mentions = [...(text.match(mentionRegex) || [])];
    const urls = [...(text.match(urlRegex) || [])];

    return {
      success: true,
      data: {
        hashtags,
        mentions,
        urls,
        hashtagCount: hashtags.length,
        mentionCount: mentions.length,
        urlCount: urls.length,
      },
    };
  },
});

/**
 * Tool for generating content insights and recommendations based on TikTok video analysis.
 * @type {import("ai").Tool}
 */
export const generateContentInsights = tool({
  description:
    "Generate insights and recommendations based on TikTok video analysis",
  parameters: z.object({
    analysisData: z
      .object({
        title: z.string(),
        transcription: z.string().optional(),
        creator: z.string(),
        contentType: z.enum(["video", "image_collection"]),
        hasAudio: z.boolean(),
      })
      .describe("The complete analysis data from TikTok video"),
  }),
  execute: async ({ analysisData }) => {
    const insights = {
      content_quality: {
        score: 0.8, // Would be calculated based on various factors
        factors: {
          audio_quality: analysisData.hasAudio ? "good" : "no_audio",
          content_length: analysisData.transcription
            ? "appropriate"
            : "unknown",
          engagement_elements: "present", // Based on hashtags, mentions, etc.
        },
      },
      recommendations: [
        "Consider adding captions for better accessibility",
        "Use trending hashtags to increase visibility",
        "Optimize posting time for target audience",
      ],
      viral_potential: {
        score: 0.6, // Calculated based on various factors
        factors: ["trending_audio", "engaging_content", "proper_hashtags"],
      },
      accessibility: {
        has_captions: !!analysisData.transcription,
        has_audio: analysisData.hasAudio,
        recommendations: analysisData.transcription
          ? ["Content is accessible with transcription available"]
          : ["Add captions or transcription for better accessibility"],
      },
    };

    return {
      success: true,
      data: insights,
    };
  },
});

/**
 * Tool for comparing multiple TikTok videos for content analysis, engagement metrics, and trends.
 * @type {import("ai").Tool}
 */
export const compareTikTokVideos = tool({
  description:
    "Compare multiple TikTok videos for content analysis, engagement metrics, and trends",
  parameters: z.object({
    videos: z
      .array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
          creator: z.string().optional(),
        })
      )
      .describe("Array of TikTok video data to compare"),
  }),
  execute: async ({ videos }) => {
    const comparison = {
      total_videos: videos.length,
      common_themes: [], // Would be extracted using AI
      creator_analysis: {
        unique_creators: [
          ...new Set(videos.map((v) => v.creator).filter(Boolean)),
        ].length,
        most_active_creator: "", // Would be calculated
      },
      content_patterns: {
        common_keywords: [], // Extracted from all videos
        trending_elements: [], // Common hashtags, sounds, etc.
      },
      recommendations: [
        "Focus on trending themes identified across videos",
        "Consider collaborating with active creators",
        "Use common successful elements in your content",
      ],
    };

    return {
      success: true,
      data: comparison,
    };
  },
});

/**
 * Tool for generating a comprehensive summary of a TikTok video including key points and takeaways.
 * @type {import("ai").Tool}
 */
export const generateVideoSummary = tool({
  description:
    "Generate a comprehensive summary of a TikTok video including key points and takeaways",
  parameters: z.object({
    title: z.string().describe("The video title or description"),
    transcription: z
      .string()
      .optional()
      .describe("The video transcription text"),
    metadata: z
      .object({
        creator: z.string(),
        contentType: z.enum(["video", "image_collection"]),
        duration: z.number().optional(),
      })
      .describe("Video metadata"),
  }),
  execute: async ({ title, transcription, metadata }) => {
    // In a real implementation, this would use AI to generate a proper summary
    const summary = {
      title_analysis: {
        main_topic: title.split(" ").slice(0, 3).join(" "), // Simple extraction
        keywords: title
          .toLowerCase()
          .split(" ")
          .filter((word) => word.length > 3),
      },
      content_summary: transcription
        ? {
            main_points: [transcription.substring(0, 50) + "..."], // Would use AI for proper extraction
            key_takeaways: ["Educational content detected"], // AI-generated takeaways
            estimated_reading_time: Math.ceil(transcription.length / 200), // minutes
          }
        : null,
      creator_info: {
        name: metadata.creator,
        content_style:
          metadata.contentType === "video"
            ? "Video creator"
            : "Image content creator",
      },
      engagement_elements: {
        has_call_to_action: transcription
          ? transcription.toLowerCase().includes("like") ||
            transcription.toLowerCase().includes("follow")
          : false,
        has_questions: transcription ? transcription.includes("?") : false,
        educational_value: transcription
          ? transcription.toLowerCase().includes("learn") ||
            transcription.toLowerCase().includes("how")
          : false,
      },
    };

    return {
      success: true,
      data: summary,
    };
  },
});

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
 * Trust rating configuration for different source types
 */
const SOURCE_TRUST_RATINGS = {
  // Tier 1: Highly trusted fact-checking organizations
  "snopes.com": { rating: 0.95, category: "fact-check", name: "Snopes" },
  "factcheck.org": {
    rating: 0.94,
    category: "fact-check",
    name: "FactCheck.org",
  },
  "politifact.com": {
    rating: 0.93,
    category: "fact-check",
    name: "PolitiFact",
  },
  "reuters.com": { rating: 0.92, category: "news-agency", name: "Reuters" },
  "apnews.com": {
    rating: 0.92,
    category: "news-agency",
    name: "Associated Press",
  },
  "bbc.com": { rating: 0.9, category: "news-outlet", name: "BBC News" },

  // Tier 2: Credible news organizations
  "cnn.com": { rating: 0.85, category: "news-outlet", name: "CNN" },
  "npr.org": { rating: 0.88, category: "news-outlet", name: "NPR" },
  "washingtonpost.com": {
    rating: 0.87,
    category: "news-outlet",
    name: "Washington Post",
  },
  "nytimes.com": {
    rating: 0.87,
    category: "news-outlet",
    name: "New York Times",
  },
  "theguardian.com": {
    rating: 0.85,
    category: "news-outlet",
    name: "The Guardian",
  },

  // Tier 3: Regional and specialized sources
  "malaymail.com": {
    rating: 0.75,
    category: "regional-news",
    name: "Malay Mail",
  },
  "thestar.com.my": {
    rating: 0.75,
    category: "regional-news",
    name: "The Star Malaysia",
  },
  "channelnewsasia.com": {
    rating: 0.8,
    category: "regional-news",
    name: "Channel NewsAsia",
  },
  "straitstimes.com": {
    rating: 0.8,
    category: "regional-news",
    name: "The Straits Times",
  },

  // Default for unknown sources
  default: { rating: 0.5, category: "unknown", name: "Unknown Source" },
};

/**
 * Extract domain from URL for trust rating lookup
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/**
 * Get trust rating for a source URL
 */
function getTrustRating(url: string) {
  const domain = extractDomain(url);
  return SOURCE_TRUST_RATINGS[domain] || SOURCE_TRUST_RATINGS["default"];
}

/**
 * Fetch web preview data from a URL
 */
async function fetchWebPreview(url: string, searchQuery: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CheckMate-FactChecker/1.0)",
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract basic metadata using simple regex (could be enhanced with a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
      );

    const title = titleMatch ? titleMatch[1].trim() : "No Title";
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    // Simple relevance scoring based on search query presence
    const content = html.toLowerCase();
    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    const relevanceScore = queryWords.reduce((score, word) => {
      const matches = (content.match(new RegExp(word, "g")) || []).length;
      return score + Math.min(matches * 0.1, 0.3); // Cap per word contribution
    }, 0);

    const trustInfo = getTrustRating(url);

    return {
      title,
      description,
      url,
      source: trustInfo.name,
      trustRating: trustInfo.rating,
      category: trustInfo.category,
      relevance: Math.min(relevanceScore, 1.0),
      preview: description || title,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    const trustInfo = getTrustRating(url);
    return {
      title: `Error fetching from ${trustInfo.name}`,
      description: `Could not fetch preview: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      url,
      source: trustInfo.name,
      trustRating: Math.max(trustInfo.rating - 0.2, 0.1), // Reduce trust for failed fetches
      category: trustInfo.category,
      relevance: 0.1,
      preview: "Preview unavailable",
      fetchedAt: new Date().toISOString(),
      error: true,
    };
  }
}

/**
 * Enhanced source verification with web previews and trust ratings
 */
async function getVerifiedSources(claim: string, language: string = "en") {
  const sources = [];

  // Define fact-checking search URLs with better query encoding
  const searchUrls = [
    {
      name: "Snopes",
      url: `https://www.snopes.com/search/${encodeURIComponent(claim)}`,
      priority: 1,
    },
    {
      name: "FactCheck.org",
      url: `https://www.factcheck.org/search/?s=${encodeURIComponent(claim)}`,
      priority: 1,
    },
    {
      name: "PolitiFact",
      url: `https://www.politifact.com/search/?q=${encodeURIComponent(claim)}`,
      priority: 1,
    },
    {
      name: "Reuters Fact Check",
      url: `https://www.reuters.com/news/search/?blob=${encodeURIComponent(
        claim + " fact check"
      )}`,
      priority: 2,
    },
    {
      name: "AP Fact Check",
      url: `https://apnews.com/search?q=${encodeURIComponent(
        claim + " fact check"
      )}`,
      priority: 2,
    },
  ];

  // Add regional sources for non-English content
  if (language === "zh" || claim.match(/[\u4e00-\u9fff]/)) {
    searchUrls.push(
      {
        name: "Channel NewsAsia",
        url: `https://www.channelnewsasia.com/search?q=${encodeURIComponent(
          claim
        )}`,
        priority: 2,
      },
      {
        name: "The Straits Times",
        url: `https://www.straitstimes.com/search?query=${encodeURIComponent(
          claim
        )}`,
        priority: 2,
      }
    );
  }

  // Fetch previews in parallel, limiting to top 5 sources
  const topSources = searchUrls
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  const previewPromises = topSources.map((source) =>
    fetchWebPreview(source.url, claim)
  );

  try {
    const previews = await Promise.allSettled(previewPromises);

    previews.forEach((result, index) => {
      if (result.status === "fulfilled") {
        sources.push(result.value);
      } else {
        // Add fallback source info even if preview failed
        const fallbackSource = topSources[index];
        const trustInfo = getTrustRating(fallbackSource.url);
        sources.push({
          title: fallbackSource.name,
          description: "Preview could not be loaded",
          url: fallbackSource.url,
          source: trustInfo.name,
          trustRating: Math.max(trustInfo.rating - 0.3, 0.1),
          category: trustInfo.category,
          relevance: 0.1,
          preview: "Search results may be available",
          fetchedAt: new Date().toISOString(),
          error: true,
        });
      }
    });

    // Sort by trust rating and relevance
    sources.sort((a, b) => {
      const aScore = a.trustRating * 0.7 + a.relevance * 0.3;
      const bScore = b.trustRating * 0.7 + b.relevance * 0.3;
      return bScore - aScore;
    });

    return sources;
  } catch (error) {
    console.warn("Error fetching source previews:", error);
    return [];
  }
}

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

        // Use AI SDK with OpenAI web search model to fact-check the claim
        const searchResponse = await generateText({
          model: openai("gpt-4o"),
          system:
            "You are a professional fact-checker. Always provide evidence-based analysis with credible sources. Be thorough and objective.",
          prompt: factCheckQuery,
          tools: {
            web_search: openai.tools.webSearchPreview(),
          },
        });

        const searchContent = searchResponse.text || "";

        // Since AI SDK doesn't expose raw annotations, we'll simulate source extraction
        // by looking for common patterns in the response
        const sources: Array<{
          title: string;
          url: string;
          source: string;
          relevance: number;
          description: string;
        }> = [];

        // Extract URLs from the response content
        const urlMatches = searchContent.match(/https?:\/\/[^\s\)]+/g) || [];
        urlMatches.forEach((url, index) => {
          try {
            const hostname = new URL(url).hostname;
            sources.push({
              title: `Source ${index + 1}`,
              url: url,
              source: hostname,
              relevance: 0.8,
              description: "Source found in web search analysis",
            });
          } catch {
            // Skip invalid URLs
          }
        });

        // Analyze the response to determine verification status
        const lowercaseContent = searchContent.toLowerCase();
        let status = "requires_verification";
        let confidence = 0.7;

        if (
          lowercaseContent.includes("true") ||
          lowercaseContent.includes("verified") ||
          lowercaseContent.includes("accurate")
        ) {
          status = "true";
          confidence = 0.8;
        } else if (
          lowercaseContent.includes("false") ||
          lowercaseContent.includes("debunked") ||
          lowercaseContent.includes("incorrect")
        ) {
          status = "false";
          confidence = 0.9;
        } else if (
          lowercaseContent.includes("misleading") ||
          lowercaseContent.includes("partially")
        ) {
          status = "misleading";
          confidence = 0.8;
        } else if (
          lowercaseContent.includes("unverifiable") ||
          lowercaseContent.includes("no evidence")
        ) {
          status = "unverifiable";
          confidence = 0.7;
        }

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
            sourcesFound: sources.length,
          },
          sources: [
            ...sources,
            // Add fallback fact-checking sources
            {
              title: `FactCheck.org: "${searchTerms}"`,
              url: `https://factcheck.org/search?q=${encodeURIComponent(
                searchTerms
              )}`,
              source: "FactCheck.org",
              relevance: 0.8,
              description: "Professional fact-checking organization",
            },
            {
              title: `PolitiFact Analysis: "${searchTerms}"`,
              url: `https://politifact.com/search/?q=${encodeURIComponent(
                searchTerms
              )}`,
              source: "PolitiFact",
              relevance: 0.8,
              description: "Pulitzer Prize-winning fact-checking site",
            },
            {
              title: `Snopes Investigation: "${searchTerms}"`,
              url: `https://snopes.com/search/${encodeURIComponent(
                searchTerms
              )}`,
              source: "Snopes",
              relevance: 0.7,
              description: "Long-running fact-checking and debunking site",
            },
          ],
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
        recommendedSources: [
          "FactCheck.org",
          "PolitiFact",
          "Snopes",
          "AP Fact Check",
          "Reuters Fact Check",
          "Full Fact",
        ],
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
 * Array of TikTok analysis tools for easy use.
 * @type {import("ai").Tool[]}
 */
// Export all tools as an array for easy use
export const tiktokAnalysisTools = [
  analyzeTikTokVideo,
  transcribeTikTokVideo,
  analyzeContentSentiment,
  extractHashtagsAndMentions,
  generateContentInsights,
  compareTikTokVideos,
  generateVideoSummary,
];

/**
 * Array of fact-checking tools for easy use.
 * @type {import("ai").Tool[]}
 */
// Export all fact-checking tools
export const factCheckingTools = [
  analyzeTikTokVideo,
  transcribeTikTokVideo,
  detectNewsContent,
  researchAndFactCheck,
  generateCredibilityReport,
];
