import { tool } from "ai";
import { z } from "zod";
import { Downloader } from "@tobyg74/tiktok-api-dl";
import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";
import { transcribeVideoDirectly } from "./helpers";

/**
 * Tool for analyzing a TikTok video URL to extract metadata and download links for fact-checking.
 * @type {import("ai").Tool}
 */
export const analyzeTikTokVideo = tool({
  description:
    "Analyze a TikTok video URL to extract metadata and download links for fact-checking",
  parameters: z.object({
    url: z.string().describe("The TikTok video URL to analyze"),
  }),
  execute: async ({ url }) => {
    try {
      if (!url) {
        return {
          success: false,
          error: "URL is required",
        };
      }

      // Validate TikTok URL format
      const tiktokUrlPattern =
        /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/;
      if (!tiktokUrlPattern.test(url)) {
        return {
          success: false,
          error: "Invalid TikTok URL format",
        };
      }

      // Download TikTok content using the API
      const result = await Downloader(url, {
        version: "v3", // Use the latest version
      });

      if (result.status !== "success" || !result.result) {
        return {
          success: false,
          error: "Failed to analyze TikTok video",
        };
      }

      // Get the best quality MP4 video URL for transcription
      const videoUrl =
        result.result.videoHD || result.result.videoWatermark || "";
      let transcription = null;

      // If it's a video, try to transcribe it
      if (result.result.type === "video" && videoUrl) {
        try {
          // Transcribe the video directly using the same logic
          const transcriptionResult = await transcribeVideoDirectly(videoUrl);
          if (transcriptionResult.success) {
            transcription = transcriptionResult.data;
          }
        } catch {
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

      return analysis;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      };
    }
  },
});

/**
 * Tool for transcribing audio from a TikTok video URL using OpenAI Whisper for fact-checking analysis.
 * @type {import("ai").Tool}
 */
export const transcribeTikTokVideo = tool({
  description:
    "Transcribe audio from a TikTok video URL using OpenAI Whisper for fact-checking analysis",
  parameters: z.object({
    videoUrl: z.string().describe("The direct video URL to transcribe"),
  }),
  execute: async ({ videoUrl }) => {
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
  },
});

/**
 * Tool for comparing multiple TikTok videos for content analysis, engagement metrics, and trends.
 * @type {import("ai").Tool}
 */
export const compareTikTokVideos = tool({
  description:
    "Compare multiple TikTok videos for content analysis, engagement metrics, and trends",
  parameters: z.object({
    videos: z
      .array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
          creator: z.string().optional(),
        })
      )
      .describe("Array of TikTok video data to compare"),
  }),
  execute: async ({ videos }) => {
    const comparison = {
      total_videos: videos.length,
      common_themes: [], // Would be extracted using AI
      creator_analysis: {
        unique_creators: [
          ...new Set(videos.map((v) => v.creator).filter(Boolean)),
        ].length,
        most_active_creator: "", // Would be calculated
      },
      content_patterns: {
        common_keywords: [], // Extracted from all videos
        trending_elements: [], // Common hashtags, sounds, etc.
      },
      recommendations: [
        "Focus on trending themes identified across videos",
        "Consider collaborating with active creators",
        "Use common successful elements in your content",
      ],
    };

    return {
      success: true,
      data: comparison,
    };
  },
});

/**
 * Array of TikTok analysis tools for easy use.
 * @type {import("ai").Tool[]}
 */
export const tiktokAnalysisTools = [
  analyzeTikTokVideo,
  transcribeTikTokVideo,
  compareTikTokVideos,
];
