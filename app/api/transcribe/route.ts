import { NextRequest, NextResponse } from "next/server";
import { transcribeVideoDirectly } from "../../../tools/tools";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Use the transcribeVideoDirectly helper function
    const result = await transcribeVideoDirectly(videoUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "OpenAI API key not configured" ? 500 : 400 }
      );
    }

    return NextResponse.json(result);
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
