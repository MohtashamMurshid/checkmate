import { NextRequest, NextResponse } from "next/server";
import { transcribeVideoDirectly } from "../../../tools/index";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { Scraper } from "@the-convocation/twitter-scraper";
import { researchAndFactCheck } from "../../../tools/fact-checking";

// Define interfaces for proper typing
interface FactCheckResult {
  claim: string;
  status: string;
  confidence: number;
  analysis?: string;
  sources?: Array<{
    title: string;
    url: string;
    source: string;
    relevance: number;
  }>;
  error?: string;
}

interface FactCheckData {
  results: FactCheckResult[];
  summary: {
    verifiedTrue: number;
    verifiedFalse: number;
    misleading: number;
    unverifiable: number;
    needsVerification: number;
  };
}

// Initialize Twitter scraper instance
const twitterScraper = new Scraper();

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, tiktokUrl, twitterUrl } = await request.json();

    // Validate input - either videoUrl (direct video), tiktokUrl (TikTok URL), or twitterUrl (Twitter URL)
    if (!videoUrl && !tiktokUrl && !twitterUrl) {
      return NextResponse.json(
        { success: false, error: "Either videoUrl, tiktokUrl, or twitterUrl is required" },
        { status: 400 }
      );
    }

    // Determine the platform and URL to use
    const actualUrl = twitterUrl || tiktokUrl || videoUrl;
    const platform = twitterUrl ? 'twitter' : 'tiktok';

    // Validate URL format based on platform
    if (platform === 'twitter') {
      const twitterUrlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
      if (!twitterUrlPattern.test(actualUrl)) {
        return NextResponse.json(
          { success: false, error: "Invalid Twitter URL format" },
          { status: 400 }
        );
      }
    } else {
      const tiktokUrlPattern = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      if (!tiktokUrlPattern.test(actualUrl)) {
        return NextResponse.json(
          { success: false, error: "Invalid TikTok URL format" },
          { status: 400 }
        );
      }
    }

    let result: any;
    let extractedVideoUrl = "";
    let transcription = null;
    let contentText = "";

    if (platform === 'twitter') {
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
              unique_id: tweet.username || "unknown"
            },
            video: null,
            videoHD: null,
            videoWatermark: null,
            // Check if tweet has video content
            ...(tweet.videos && tweet.videos.length > 0 && {
              video: tweet.videos[0].url,
              videoHD: tweet.videos[0].url,
              videoWatermark: tweet.videos[0].url
            })
          }
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

      extractedVideoUrl = result.result.videoHD || result.result.videoWatermark || "";
      contentText = result.result.desc || "";
    }

    // Try to transcribe video if available
    if (extractedVideoUrl && (result.result.type === "video" || platform === 'twitter')) {
      try {
        const transcriptionResult = await transcribeVideoDirectly(extractedVideoUrl);
        if (transcriptionResult.success && transcriptionResult.data) {
          transcription = transcriptionResult.data;
        }
      } catch {
        // Continue without transcription if it fails
      }
    }

    // Perform fact-checking if we have content (transcription or text)
    let factCheckResults = null;
    const textToFactCheck = transcription?.text || contentText;

    if (textToFactCheck && textToFactCheck.trim().length > 0) {
      try {
        console.log("🔍 Starting fact-checking process...");

        // Break down the content into key statements for fact-checking
        const sentences = textToFactCheck
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 20)
          .slice(0, 3); // Take first 3 substantial sentences

        const claimsToCheck =
          sentences.length > 0 ? sentences : [textToFactCheck.slice(0, 500)];

        console.log("✅ Starting fact-check for claims:", claimsToCheck);

        // Prepare comprehensive context with content metadata
        const creator = platform === 'twitter' 
          ? (result.result.author?.unique_id || "Unknown")
          : (result.result.author?.nickname || "Unknown");
        
        const description = platform === 'twitter' 
          ? result.result.text 
          : (result.result.desc || "");

        const contextPrompt = `
${platform === 'twitter' ? 'Twitter/X' : 'TikTok'} Post Analysis Context:
- Creator: ${creator}
- ${platform === 'twitter' ? 'Post' : 'Video'} Content: "${description}"
- ${platform === 'twitter' ? 'Post' : 'Video'} URL: ${actualUrl}
- Platform: ${platform === 'twitter' ? 'Twitter/X' : 'TikTok'}

${transcription ? `Transcribed Content: "${transcription.text}"` : ''}

Please fact-check the claims from this ${platform === 'twitter' ? 'Twitter/X post' : 'TikTok video'} content, paying special attention to both the ${platform === 'twitter' ? 'post text' : 'video description'} ${transcription ? 'and the transcribed speech' : ''}. Consider the context that this is social media content that may contain opinions, personal experiences, or claims that need verification.`;

        const factCheck = await researchAndFactCheck.execute(
          {
            claims: claimsToCheck,
            context: contextPrompt,
          },
          {
            toolCallId: "research-fact-check",
            messages: [],
          }
        );

        console.log("🔬 Fact-check result:", factCheck);

        if (factCheck.success && factCheck.data) {
          factCheckResults = {
            totalClaims: claimsToCheck.length,
            checkedClaims: factCheck.data.results?.length || 0,
            results:
              (factCheck.data as FactCheckData).results?.map(
                (r: FactCheckResult) => ({
                  claim: r.claim,
                  status: r.status,
                  confidence: r.confidence,
                  analysis: r.analysis,
                  sources: r.sources || [],
                  error: r.error,
                })
              ) || [],
            summary: (factCheck.data as FactCheckData).summary || {
              verifiedTrue: 0,
              verifiedFalse: 0,
              misleading: 0,
              unverifiable: 0,
              needsVerification: 0,
            },
          };

          console.log("📋 Final fact-check results:", factCheckResults);
        } else {
          console.warn("❌ Fact-check failed or returned no data:", factCheck);

          // Create a fallback fact-check result
          factCheckResults = {
            totalClaims: claimsToCheck.length,
            checkedClaims: 0,
            results: claimsToCheck.map((claim: string) => ({
              claim,
              status: "requires_verification",
              confidence: 0.5,
              analysis:
                "Automatic fact-checking failed. Manual verification recommended.",
              sources: [],
              error: "Fact-checking service temporarily unavailable",
            })),
            summary: {
              verifiedTrue: 0,
              verifiedFalse: 0,
              misleading: 0,
              unverifiable: 0,
              needsVerification: claimsToCheck.length,
            },
          };

          console.log(
            "🔄 Using fallback fact-check results:",
            factCheckResults
          );
        }
      } catch (error) {
        console.error("💥 Fact-checking process failed:", error);
        // Continue without fact-checking if it fails
      }
    } else {
      console.log("⚠️ No content available for fact-checking");
    }

    // Format the response to match the expected interface
    const responseData = {
      transcription: transcription || {
        text: "",
        segments: [],
        language: undefined,
      },
      metadata: {
        title: platform === 'twitter' 
          ? (result.result.text || "Twitter Post") 
          : (result.result.desc || "TikTok Video"),
        description: platform === 'twitter' 
          ? (result.result.text || "") 
          : (result.result.desc || ""),
        creator: platform === 'twitter' 
          ? (result.result.author?.unique_id || "Unknown")
          : (result.result.author?.nickname || "Unknown"),
        originalUrl: actualUrl,
        platform: platform,
      },
      factCheck: factCheckResults,
      requiresFactCheck: !!factCheckResults,
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
