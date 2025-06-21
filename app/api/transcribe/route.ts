import { NextRequest, NextResponse } from "next/server";
import { transcribeVideoDirectly } from "../../../tools/tools";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, tiktokUrl, title, description } = await request.json();

    // Validate input - either videoUrl (direct video) or tiktokUrl (TikTok URL)
    if (!videoUrl && !tiktokUrl) {
      return NextResponse.json(
        { success: false, error: "Either videoUrl or tiktokUrl is required" },
        { status: 400 }
      );
    }

    let videoTitle = title || "";
    const videoDescription = description || "";
    let creator = "";
    let actualVideoUrl = videoUrl;

    // If TikTok URL is provided, analyze it first to get metadata and video URL
    if (tiktokUrl) {
      console.log("Analyzing TikTok video for metadata...");

      try {
        // Validate TikTok URL format
        const tiktokUrlPattern =
          /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
        if (!tiktokUrlPattern.test(tiktokUrl)) {
          return NextResponse.json(
            { success: false, error: "Invalid TikTok URL format" },
            { status: 400 }
          );
        }

        // Download TikTok content using the API
        const result = await Downloader(tiktokUrl, {
          version: "v3",
        });

        if (result.status === "success" && result.result) {
          // Extract metadata
          videoTitle = result.result.desc || videoTitle || "TikTok Video";
          creator = result.result.author?.nickname || "";

          // Get the best quality video URL for transcription
          actualVideoUrl =
            result.result.videoHD ||
            result.result.videoWatermark ||
            actualVideoUrl;
        }
      } catch (error) {
        console.warn(
          "TikTok analysis failed, proceeding with direct transcription:",
          error
        );
      }
    }

    // Transcribe the video
    if (!actualVideoUrl) {
      return NextResponse.json(
        { success: false, error: "No video URL available for transcription" },
        { status: 400 }
      );
    }

    console.log("Transcribing video...");
    const transcriptionResult = await transcribeVideoDirectly(actualVideoUrl);

    if (!transcriptionResult.success) {
      return NextResponse.json(
        { success: false, error: transcriptionResult.error },
        {
          status:
            transcriptionResult.error === "OpenAI API key not configured"
              ? 500
              : 400,
        }
      );
    }

    const transcriptionText = transcriptionResult.data?.text || "";

    // Detect if content contains news or factual claims
    console.log("Detecting news content...");
    let newsDetection = null;
    let factCheckResults = null;

    try {
      // Assume all content is news and extract potential claims
      const sentences = transcriptionText
        .split(/[.!?]+/)
        .filter((s: string) => s.trim().length > 10)
        .map((s: string) => s.trim());

      const potentialClaims = sentences.slice(0, 5); // Limit to top 5 claims

      newsDetection = {
        hasNewsContent: true,
        confidence: 0.8,
        newsKeywordsFound: [],
        potentialClaims,
        needsFactCheck: true,
        contentType: "news_factual",
      };

      // Perform fact-checking on the claims
      if (potentialClaims.length > 0) {
        console.log("News content detected, performing fact-checking...");

        // Limit to 3 claims to avoid rate limits
        const claimsToCheck = potentialClaims.slice(0, 3);
        const factCheckResults_array = [];

        for (const claim of claimsToCheck) {
          try {
            // Create a comprehensive fact-checking query
            const factCheckQuery = `Fact-check this claim with credible sources: "${claim}". 
            Context: TikTok video by ${creator}: ${videoTitle}. ${
              videoDescription || ""
            }
            
            Please provide:
            1. Verification status (true/false/misleading/unverifiable)
            2. Evidence from credible sources
            3. List credible fact-checking websites and news sources
            4. Include URLs when possible
            5. Explain any nuances or context`;

            // Use AI SDK with OpenAI to fact-check the claim
            const searchResponse = await generateText({
              model: openai("gpt-4o"),
              system:
                "You are a professional fact-checker. Always provide evidence-based analysis with credible sources. Be thorough and objective.",
              prompt: factCheckQuery,
            });

            const searchContent = searchResponse.text || "";

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

            factCheckResults_array.push({
              claim,
              status,
              confidence,
              analysis: searchContent,
              sources: [],
            });
          } catch (error) {
            factCheckResults_array.push({
              claim,
              status: "error",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to research this claim",
              confidence: 0,
            });
          }
        }

        factCheckResults = {
          totalClaims: potentialClaims.length,
          checkedClaims: factCheckResults_array.length,
          results: factCheckResults_array,
          summary: {
            verifiedTrue: factCheckResults_array.filter(
              (r) => r.status === "true"
            ).length,
            verifiedFalse: factCheckResults_array.filter(
              (r) => r.status === "false"
            ).length,
            misleading: factCheckResults_array.filter(
              (r) => r.status === "misleading"
            ).length,
            unverifiable: factCheckResults_array.filter(
              (r) => r.status === "unverifiable"
            ).length,
            needsVerification: factCheckResults_array.filter(
              (r) => r.status === "requires_verification"
            ).length,
          },
        };
      }
    } catch (error) {
      console.warn("News detection or fact-checking failed:", error);
    }

    // Prepare response data
    const responseData = {
      transcription: transcriptionResult.data,
      metadata: {
        title: videoTitle,
        description: videoDescription,
        creator,
        originalUrl: tiktokUrl || videoUrl,
      },
      newsDetection,
      factCheck: factCheckResults,
      requiresFactCheck: newsDetection?.hasNewsContent || false,
    };

    // Return comprehensive results
    const response = {
      success: true,
      data: responseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Transcription and fact-check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      },
      { status: 500 }
    );
  }
}
