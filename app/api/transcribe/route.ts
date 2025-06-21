import { NextRequest, NextResponse } from "next/server";
import {
  transcribeVideoDirectly,
  scrapeWebContent,
} from "../../../tools/index";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { Scraper } from "@the-convocation/twitter-scraper";
import { researchAndFactCheck } from "../../../tools/fact-checking";
import { calculateCreatorCredibilityRating } from "../../../tools/content-analysis";

// Define interfaces for proper typing
export interface FactCheckData {
  overallStatus: string;
  confidence: number;
  isVerified: boolean;
  isMisleading: boolean;
  isUnverifiable: boolean;
  reasoning: string;
  sources: Array<{
    title: string;
    url: string;
    source?: string;
    relevance?: number;
  }>;
  error?: string;
  webSearchAnalysis?: {
    summary: string;
  };
}

interface AnalysisResult {
  status: string;
  result?: {
    type: string;
    text?: string;
    desc?: string;
    author?: {
      nickname: string;
      unique_id?: string;
    };
    video?: string | null;
    videoHD?: string | null;
    videoWatermark?: string | null;
    videos?: { url: string }[];
  };
}

// Initialize Twitter scraper instance
const twitterScraper = new Scraper();

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, tiktokUrl, twitterUrl, webUrl } = await request.json();

    // Validate input - accept any URL parameter
    if (!videoUrl && !tiktokUrl && !twitterUrl && !webUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A URL is required (videoUrl, tiktokUrl, twitterUrl, or webUrl)",
        },
        { status: 400 }
      );
    }

    // Determine the platform and URL to use
    const actualUrl = webUrl || twitterUrl || tiktokUrl || videoUrl;

    // Detect platform based on URL patterns
    const tiktokUrlPattern =
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
    const twitterUrlPattern =
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;

    let platform: string;
    if (tiktokUrlPattern.test(actualUrl)) {
      platform = "tiktok";
    } else if (twitterUrlPattern.test(actualUrl)) {
      platform = "twitter";
    } else {
      platform = "web";
    }

    // Validate URL format based on platform (only for specific platforms)
    if (platform === "twitter") {
      if (!twitterUrlPattern.test(actualUrl)) {
        return NextResponse.json(
          { success: false, error: "Invalid Twitter URL format" },
          { status: 400 }
        );
      }
    } else if (platform === "tiktok") {
      if (!tiktokUrlPattern.test(actualUrl)) {
        return NextResponse.json(
          { success: false, error: "Invalid TikTok URL format" },
          { status: 400 }
        );
      }
    } else if (platform === "web") {
      // Basic URL validation for web content
      try {
        new URL(actualUrl);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    let result: AnalysisResult;
    let extractedVideoUrl = "";
    let transcription: {
      text: string;
      segments: unknown[];
      language: string | undefined;
    } | null = null;
    let contentText = "";

    if (platform === "twitter") {
      // Handle Twitter/X post
      try {
        // Extract tweet ID from URL
        const tweetIdMatch = actualUrl.match(/status\/(\d+)/);
        if (!tweetIdMatch) {
          return NextResponse.json(
            { success: false, error: "Could not extract tweet ID from URL" },
            { status: 400 }
          );
        }

        const tweetId = tweetIdMatch[1];
        const tweet = await twitterScraper.getTweet(tweetId);

        if (!tweet) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch Twitter post" },
            { status: 500 }
          );
        }

        result = {
          status: "success",
          result: {
            type: "tweet",
            text: tweet.text || "",
            desc: tweet.text || "",
            author: {
              nickname: tweet.username || "Unknown",
              unique_id: tweet.username || "unknown",
            },
            video: null,
            videoHD: null,
            videoWatermark: null,
            // Check if tweet has video content
            ...(tweet.videos &&
              tweet.videos.length > 0 && {
                video: tweet.videos[0].url,
                videoHD: tweet.videos[0].url,
                videoWatermark: tweet.videos[0].url,
              }),
          },
        };

        contentText = tweet.text || "";

        // If there's a video in the tweet, try to transcribe it
        if (tweet.videos && tweet.videos.length > 0) {
          extractedVideoUrl = tweet.videos[0].url || "";
        }
      } catch (error) {
        console.error("Twitter scraping error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to analyze Twitter post" },
          { status: 500 }
        );
      }
    } else if (platform === "web") {
      // Handle general web content using Firecrawl
      try {
        const scrapeResult = await scrapeWebContent(actualUrl);

        if (!scrapeResult.success || !scrapeResult.data) {
          return NextResponse.json(
            {
              success: false,
              error: scrapeResult.error || "Failed to scrape web content",
            },
            { status: 500 }
          );
        }

        result = {
          status: "success",
          result: {
            type: "web_content",
            text: scrapeResult.data.content,
            desc: scrapeResult.data.description || scrapeResult.data.title,
            author: {
              nickname: scrapeResult.data.author || "Unknown",
              unique_id: scrapeResult.data.author || "unknown",
            },
            video: null,
            videoHD: null,
            videoWatermark: null,
          },
        };

        contentText =
          scrapeResult.data.content || scrapeResult.data.description || "";
      } catch (error) {
        console.error("Web scraping error:", error);
        return NextResponse.json(
          { success: false, error: "Failed to analyze web content" },
          { status: 500 }
        );
      }
    } else {
      // Handle TikTok video (existing logic)
      result = await Downloader(actualUrl, {
        version: "v3",
      });

      if (result.status !== "success" || !result.result) {
        return NextResponse.json(
          { success: false, error: "Failed to analyze TikTok video" },
          { status: 500 }
        );
      }

      extractedVideoUrl =
        result.result.videoHD || result.result.videoWatermark || "";
      contentText = result.result.desc || "";
    }

    // Try to transcribe video if available
    if (
      extractedVideoUrl &&
      (result.result?.type === "video" || platform === "twitter")
    ) {
      try {
        const transcriptionResult =
          await transcribeVideoDirectly(extractedVideoUrl);
        if (transcriptionResult.success && transcriptionResult.data) {
          transcription = transcriptionResult.data;
        }
      } catch {
        // Continue without transcription if it fails
      }
    }

    // Perform fact-checking if we have content (transcription or text)
    let factCheckResults = null;
    let creatorCredibilityRating = null;
    const textToFactCheck = transcription?.text || contentText;

    if (textToFactCheck && textToFactCheck.trim().length > 0) {
      if (result.result) {
        try {
          // Removed console.log for starting fact-checking process

          // Prepare comprehensive context with content metadata
          const creator =
            result.result.author?.nickname ||
            result.result.author?.unique_id ||
            "Unknown";
          const description = result.result.text || result.result.desc || "";

          let platformName: string;
          let contentType: string;
          if (platform === "twitter") {
            platformName = "Twitter/X";
            contentType = "Post";
          } else if (platform === "tiktok") {
            platformName = "TikTok";
            contentType = "Video";
          } else {
            platformName = "Web Article/Blog";
            contentType = "Content";
          }

          const contextPrompt = `${platformName} Content Analysis Context:
- ${platform === "web" ? "Source" : "Creator"}: ${creator}
- ${contentType} Content: "${description}"
- ${contentType} URL: ${actualUrl}
- Platform: ${platformName}

${transcription ? `Transcribed Content: "${transcription.text}"` : ""}

Please fact-check the claims from this ${platformName.toLowerCase()} ${contentType.toLowerCase()} content, paying special attention to ${
            platform === "web"
              ? "the article content and any factual claims made"
              : `both the ${contentType.toLowerCase()} text${transcription ? " and the transcribed speech" : ""}`
          }. Consider the context that this is ${
            platform === "web"
              ? "web content that may contain opinions, analysis, or claims that need verification"
              : "social media content that may contain opinions, personal experiences, or claims that need verification"
          }.`;

          const factCheck = await researchAndFactCheck.execute(
            {
              transcription: textToFactCheck,
              title: description,
              context: contextPrompt,
            },
            {
              toolCallId: "simple-verification",
              messages: [],
            }
          );

          // Removed console.log for fact-check result

          if (factCheck.success && factCheck.data) {
            // Extract the simple verification result
            const resultData = factCheck.data as FactCheckData;
            const contentSummary =
              resultData.webSearchAnalysis?.summary ||
              textToFactCheck.slice(0, 200);

            factCheckResults = {
              verdict: resultData.overallStatus || "unverifiable", // TRUE/FALSE/UNVERIFIABLE
              confidence: Math.round((resultData.confidence || 0.5) * 100), // Convert to percentage
              explanation: resultData.reasoning || "No analysis available",
              sources: resultData.sources || [],
              content: contentSummary,
              isVerified: true,
            };

            // Removed console.log for verification result

            // Calculate creator credibility rating
            try {
              // Removed console.log for calculating creator credibility rating

              const credibilityResult =
                await calculateCreatorCredibilityRating.execute(
                  {
                    factCheckResult: {
                      verdict: factCheckResults.verdict,
                      confidence: factCheckResults.confidence,
                      isVerified: factCheckResults.isVerified,
                    },
                    contentMetadata: {
                      creator: creator,
                      platform: platform,
                      title: description,
                      hasTranscription: !!transcription?.text,
                      contentType: result.result.type || "unknown",
                    },
                    analysisMetrics: {
                      hasNewsContent: true, // Assuming news content since we're fact-checking
                      needsFactCheck: true,
                      contentLength: textToFactCheck.length,
                    },
                  },
                  {
                    toolCallId: "credibility-rating",
                    messages: [],
                  }
                );

              if (credibilityResult.success && credibilityResult.data) {
                creatorCredibilityRating =
                  credibilityResult.data.credibilityRating;
                // Removed console.log for creator credibility rating
              }
            } catch (error) {
              console.warn(
                "⚠️ Failed to calculate creator credibility rating:",
                error
              );
            }
          } else {
            console.warn("❌ Verification failed:", factCheck);
            const contentSummary = textToFactCheck.slice(0, 200);

            // Create a fallback result
            factCheckResults = {
              verdict: "unverifiable",
              confidence: 0,
              explanation:
                "Verification service temporarily unavailable. Manual fact-checking recommended.",
              sources: [],
              content: contentSummary,
              isVerified: false,
              error: "Service unavailable",
            };

            // Removed console.log for using fallback verification
          }
        } catch (error) {
          console.error("💥 Fact-checking process failed:", error);
          // Continue without fact-checking if it fails
        }
      } else {
        // Removed console.log for no result data available for fact-checking context
      }
    } else {
      // Removed console.log for no content available for fact-checking
    }

    // Format the response to match the expected interface
    const responseData = {
      transcription: transcription || {
        text: "",
        segments: [],
        language: undefined,
      },
      metadata: {
        title:
          platform === "twitter"
            ? result.result?.text || "Twitter Post"
            : result.result?.desc || "TikTok Video",
        description:
          platform === "twitter"
            ? result.result?.text || ""
            : result.result?.desc || "",
        creator:
          platform === "twitter"
            ? result.result?.author?.unique_id || "Unknown"
            : result.result?.author?.nickname || "Unknown",
        originalUrl: actualUrl,
        platform: platform,
      },
      factCheck: factCheckResults,
      requiresFactCheck: !!factCheckResults,
      creatorCredibilityRating: creatorCredibilityRating,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Social media analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
