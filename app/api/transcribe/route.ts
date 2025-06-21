import { NextRequest, NextResponse } from "next/server";
import { transcribeVideoDirectly } from "../../../tools/index";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import {
  detectNewsContent,
  researchAndFactCheck,
} from "../../../tools/fact-checking";

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
    let newsDetection = null;
    let factCheckResults = null;

    if (transcription && transcription.text) {
      try {
        console.log("🔍 Starting fact-checking process...");

        // First, detect if the content contains news/factual claims
        console.log("📰 Detecting news content...");
        const newsDetectionResult = await detectNewsContent.execute(
          {
            transcription: transcription.text,
            title: result.result.desc || "",
          },
          {
            toolCallId: "detect-news-content",
            messages: [],
          }
        );

        console.log("📰 News detection result:", newsDetectionResult);

        if (newsDetectionResult.success && newsDetectionResult.data) {
          newsDetection = {
            hasNewsContent: newsDetectionResult.data.needsFactCheck,
            confidence: 0.8,
            newsKeywordsFound: [],
            potentialClaims: newsDetectionResult.data.potentialClaims || [],
            needsFactCheck: newsDetectionResult.data.needsFactCheck,
            contentType:
              newsDetectionResult.data.contentType || "entertainment",
          };

          console.log("📊 Formatted news detection:", newsDetection);

          // If factual content is detected, perform fact-checking
          if (newsDetectionResult.data.needsFactCheck) {
            let claimsToCheck = newsDetectionResult.data.potentialClaims || [];

            // If no specific claims were extracted, use the transcription text as a general claim
            if (claimsToCheck.length === 0) {
              // Break down the transcription into key statements for fact-checking
              const sentences = transcription.text
                .split(/[.!?]+/)
                .filter((s) => s.trim().length > 20)
                .slice(0, 3); // Take first 3 substantial sentences

              claimsToCheck =
                sentences.length > 0
                  ? sentences
                  : [transcription.text.slice(0, 500)];
            }

            console.log("✅ Starting fact-check for claims:", claimsToCheck);

            const factCheck = await researchAndFactCheck.execute(
              {
                claims: claimsToCheck,
                context: `TikTok video by ${result.result.author?.nickname || "Unknown"}: ${result.result.desc || ""}`,
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
              console.warn(
                "❌ Fact-check failed or returned no data:",
                factCheck
              );

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
          } else {
            console.log("ℹ️ No fact-checking needed or no claims detected");
          }
        } else {
          console.warn("❌ News detection failed:", newsDetectionResult);
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
      newsDetection,
      factCheck: factCheckResults,
      requiresFactCheck: newsDetection?.needsFactCheck || false,
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
