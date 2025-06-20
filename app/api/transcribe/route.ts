import { NextRequest, NextResponse } from "next/server";
import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Download the video content
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch video" },
        { status: 400 }
      );
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
    return NextResponse.json({
      success: true,
      data: {
        text: transcription.text,
        segments: transcription.segments || [],
        language: transcription.language,
      },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Transcription failed",
      },
      { status: 500 }
    );
  }
}
