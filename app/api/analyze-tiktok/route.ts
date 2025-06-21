import { NextRequest, NextResponse } from "next/server";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { transcribeVideoDirectly } from "../../../tools/index";
import {
  detectNewsContent,
  researchAndFactCheck,
} from "../../../tools/fact-checking";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { url, videoUrl, tiktokUrl, title, description } =
      await request.json();

    // Support both old (url) and new (videoUrl/tiktokUrl) parameter formats
    const actualTiktokUrl = url || tiktokUrl;
    const actualVideoUrl = videoUrl;

    // Validate input - either actualVideoUrl (direct video) or actualTiktokUrl (TikTok URL)
    if (!actualVideoUrl && !actualTiktokUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Either url, videoUrl, or tiktokUrl is required",
        },
        { status: 400 }
      );
    }

    // Validate TikTok URL format
    const tiktokUrlPattern =
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
    if (!tiktokUrlPattern.test(url)) {
      return NextResponse.json(
        { success: false, error: "Invalid TikTok URL format" },
        { status: 400 }
      );
    }

    // Download TikTok content using the new API
    const result = await Downloader(url, {
      version: "v3", // Use the latest version
    });

    if (result.status !== "success" || !result.result) {
      return NextResponse.json(
        { success: false, error: "Failed to analyze TikTok video" },
        { status: 500 }
      );
    }

    // Get the best quality MP4 video URL for transcription
    const videoUrl =
      result.result.videoHD || result.result.videoWatermark || "";
    let transcription = null;

    // If it's a video, try to transcribe it using the tool function
    if (result.result.type === "video" && videoUrl) {
      try {
        const transcriptionResult = await transcribeVideoDirectly(videoUrl);
        if (transcriptionResult.success && transcriptionResult.data) {
          transcription = transcriptionResult.data.text;
        }
      } catch {
        // Continue without transcription if it fails
      }
    }

    // Perform fact-checking if transcription is available
    let factCheckResults = null;
    if (transcription) {
      try {
        // First, detect if the content contains news/factual claims
        const newsDetection = await detectNewsContent.execute(
          {
            transcription,
            title: result.result.desc || "",
          },
          {
            toolCallId: "detect-news-content",
            messages: [],
          }
        );

        // If factual content is detected, perform fact-checking
        if (newsDetection.success && newsDetection.data.needsFactCheck) {
          const factCheck = await researchAndFactCheck.execute(
            {
              claims: newsDetection.data.potentialClaims,
              context: `TikTok video by ${result.result.author?.nickname || "Unknown"}: ${result.result.desc || ""}`,
            },
            {
              toolCallId: "research-fact-check",
              messages: [],
            }
          );

          if (factCheck.success && factCheck.data) {
            factCheckResults = {
              needsFactCheck: true,
              newsDetection: newsDetection.data,
              factCheckResults: factCheck.data,
              sources: factCheck.data.results.flatMap(
                (r: {
                  sources?: {
                    title: string;
                    url: string;
                    source: string;
                    relevance: number;
                  }[];
                }) => r.sources || []
              ),
              summary: factCheck.data.summary,
            };
          }
        } else if (newsDetection.success) {
          factCheckResults = {
            needsFactCheck: false,
            newsDetection: newsDetection.data,
            contentType: newsDetection.data.contentType,
          };
        }
      } catch (error) {
        console.warn("Fact-checking failed:", error);
        // Continue without fact-checking if it fails
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
        factCheck: factCheckResults,
      },
    };

    return NextResponse.json(analysis);
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
