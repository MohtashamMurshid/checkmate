import { NextRequest, NextResponse } from "next/server";
import { Downloader } from "@tobyg74/tiktok-api-dl";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
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

    // If it's a video, try to transcribe it
    if (result.result.type === "video" && videoUrl) {
      try {
        const transcriptionResponse = await fetch(
          `${
            process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000"
          }/api/transcribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoUrl }),
          }
        );

        if (transcriptionResponse.ok) {
          const transcriptionResult = await transcriptionResponse.json();
          if (transcriptionResult.success) {
            transcription = transcriptionResult.data;
          }
        }
      } catch (error) {
        console.error("Transcription failed:", error);
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
