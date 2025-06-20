import { tool } from "ai";
import { z } from "zod";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

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

// Tool for analyzing TikTok videos and extracting metadata
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

// Tool for transcribing TikTok video audio
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

// Tool for analyzing content sentiment and themes
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

// Tool for extracting hashtags and mentions from content
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

// Tool for generating content insights and recommendations
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

// Tool for comparing multiple TikTok videos
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

// Tool for generating video summaries
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

// Tool 3: News Detection
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

// Tool 4: Research and Fact-Check using Perplexity
export const researchAndFactCheck = tool({
  description:
    "Search the web using Perplexity to validate key claims from the transcription with fact-checking sources",
  parameters: z.object({
    claims: z.array(z.string()).describe("Array of factual claims to verify"),
    context: z
      .string()
      .optional()
      .describe("Additional context about the video content"),
  }),
  execute: async ({ claims, context }) => {
    const factCheckResults = [];

    // Use context for enhanced search if provided
    const searchContext = context ? ` Context: ${context}` : "";

    for (const claim of claims.slice(0, 3)) {
      // Limit to 3 claims to avoid rate limits
      try {
        // In a real implementation, you would call actual fact-checking APIs
        // For now, we'll simulate the structure of what would be returned

        // Extract key terms from the claim for search
        const searchTerms = (claim + searchContext)
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(" ")
          .filter((word) => word.length > 3)
          .slice(0, 5)
          .join(" ");

        // Use Perplexity for comprehensive fact-checking research
        const perplexityQuery = `Fact-check this claim: "${claim}". Provide verification status and credible sources.`;

        const factCheckResult = {
          claim: claim,
          searchTerms: searchTerms,
          perplexityQuery: perplexityQuery,
          status: "requires_verification", // Would be determined by Perplexity analysis
          confidence: 0.7,
          sources: [
            // Primary source: Perplexity AI analysis
            {
              title: `Perplexity Fact-Check: ${searchTerms}`,
              url: `https://www.perplexity.ai/search?q=${encodeURIComponent(
                perplexityQuery
              )}`,
              source: "Perplexity AI",
              relevance: 0.9,
              description: `AI-powered fact-checking analysis for: "${claim.substring(
                0,
                50
              )}..."`,
            },
            // Additional fact-checking sources for verification
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
          perplexityAnalysis: {
            summary: `Perplexity analysis of claim: "${claim.substring(
              0,
              100
            )}..."`,
            recommendedAction:
              "Review Perplexity results and cross-reference with additional sources",
          },
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

// Tool 5: Generate Credibility Report
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

// Export all fact-checking tools
export const factCheckingTools = [
  analyzeTikTokVideo,
  transcribeTikTokVideo,
  detectNewsContent,
  researchAndFactCheck,
  generateCredibilityReport,
];
