import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * Helper function to transcribe a video directly from a given URL using OpenAI Whisper.
 * @param {string} videoUrl - The direct URL of the video to transcribe.
 * @returns {Promise<{ success: boolean; data?: { text: string; segments: any[]; language: string }; error?: string }>} Transcription result object.
 */
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
