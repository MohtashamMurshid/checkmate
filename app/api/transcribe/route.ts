import { NextRequest, NextResponse } from "next/server";
import { transcribeVideoDirectly } from "../../../tools/index";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { researchAndFactCheck } from "../../../tools/fact-checking";

// Define interfaces for proper typing
interface FactCheckData {
  overallStatus: string;
  confidence: number;
  isTrue: boolean;
  isFalse: boolean;
  isMisleading: boolean;
  isUnverifiable: boolean;
  sources: Array<{
    title: string;
    url: string;
    source: string;
    relevance: number;
  }>;
  credibleSourcesCount: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, tiktokUrl } = await request.json();

    // Validate input - either videoUrl (direct video) or tiktokUrl (TikTok URL)
    if (!videoUrl && !tiktokUrl) {
      return NextResponse.json(
        { success: false, error: "Either videoUrl or tiktokUrl is required" },
        { status: 400 }
      );
    }

    // Use tiktokUrl if provided, otherwise fall back to videoUrl
    const actualTiktokUrl = tiktokUrl || videoUrl;

    // Validate TikTok URL format
    const tiktokUrlPattern =
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
    if (!tiktokUrlPattern.test(actualTiktokUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid TikTok URL format" },
        { status: 400 }
      );
    }

    // Download TikTok content using the new API
    const result = await Downloader(actualTiktokUrl, {
      version: "v3", // Use the latest version
    });

    if (result.status !== "success" || !result.result) {
      return NextResponse.json(
        { success: false, error: "Failed to analyze TikTok video" },
        { status: 500 }
      );
    }

    // Get the best quality MP4 video URL for transcription
    const extractedVideoUrl =
      result.result.videoHD || result.result.videoWatermark || "";
    let transcription = null;

    // If it's a video, try to transcribe it using the tool function
    if (result.result.type === "video" && extractedVideoUrl) {
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

    // Perform fact-checking if transcription is available
    let factCheckResults = null;

    if (transcription && transcription.text) {
      try {
        console.log("🔍 Starting fact-checking process...");

        // Prepare comprehensive context with video metadata
        const videoDescription = result.result.desc || "";
        const videoCreator = result.result.author?.nickname || "Unknown";

        // Combine transcription and description for comprehensive analysis
        const combinedContent =
          `${transcription.text} ${videoDescription}`.trim();

        // Use the entire content as a single comprehensive search query
        const contentSummary =
          combinedContent.length > 800
            ? combinedContent.slice(0, 800) + "..."
            : combinedContent;

        console.log(
          "✅ Starting comprehensive fact-check for content:",
          contentSummary
        );

        const factCheck = await researchAndFactCheck.execute(
          {
            transcription: transcription.text,
            title: videoDescription,
            context: `TikTok video by ${videoCreator}. Description: "${videoDescription}". Verify the factual accuracy of the content.`,
          },
          {
            toolCallId: "simple-verification",
            messages: [],
          }
        );

        console.log("🔬 Fact-check result:", factCheck);

        if (factCheck.success && factCheck.data) {
          // Extract the simple verification result
          const result = factCheck.data as FactCheckData;

          factCheckResults = {
            verdict: result.overallStatus || "unverifiable", // TRUE/FALSE/UNVERIFIABLE
            confidence: Math.round((result.confidence || 0.5) * 100), // Convert to percentage
            explanation: result.reasoning || "No analysis available",
            sources: result.sources || [],
            content: contentSummary,
            isVerified: true,
          };

          console.log("✅ Verification result:", factCheckResults);
        } else {
          console.warn("❌ Verification failed:", factCheck);

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

          console.log("🔄 Using fallback verification:", factCheckResults);
        }
      } catch (error) {
        console.error("💥 Fact-checking process failed:", error);
        // Continue without fact-checking if it fails
      }
    } else {
      console.log("⚠️ No transcription available for fact-checking");
    }

    // Format the response to match the expected interface
    const responseData = {
      transcription: transcription || {
        text: "",
        segments: [],
        language: undefined,
      },
      metadata: {
        title: result.result.desc || "TikTok Video",
        description: result.result.desc || "",
        creator: result.result.author?.nickname || "Unknown",
        originalUrl: actualTiktokUrl,
      },
      factCheck: factCheckResults,
      requiresFactCheck: !!factCheckResults,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("TikTok analysis error:", error);
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
