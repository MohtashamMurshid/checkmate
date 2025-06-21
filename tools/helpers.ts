import { experimental_transcribe } from "ai";
import { openai } from "@ai-sdk/openai";
import FirecrawlApp from "@mendable/firecrawl-js";

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

/**
 * Helper function to scrape web content using Firecrawl for non-TikTok/Twitter URLs.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<{ success: boolean; data?: { title: string; content: string; author?: string; description?: string }; error?: string }>} Scraping result object.
 */
export async function scrapeWebContent(url: string) {
  try {
    if (!url) {
      return {
        success: false,
        error: "URL is required",
      };
    }

    // Check if Firecrawl API key is available
    if (!process.env.FIRECRAWL_API_KEY) {
      return {
        success: false,
        error: "Firecrawl API key not configured",
      };
    }

    // Initialize Firecrawl
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    // Scrape the URL
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ["markdown", "html"],
      includeTags: ["title", "meta", "article", "main", "content"],
      excludeTags: ["nav", "footer", "sidebar", "advertisement"],
      waitFor: 1000,
    });

    if (!scrapeResult.success) {
      return {
        success: false,
        error: "Failed to scrape content from URL",
      };
    }

    const { metadata, markdown, html } = scrapeResult;

    // Extract relevant information
    const title = metadata?.title || metadata?.ogTitle || "Untitled Content";
    const description = metadata?.description || metadata?.ogDescription || "";
    const author = metadata?.author || metadata?.ogSiteName || "";
    const content = markdown || html || "";

    return {
      success: true,
      data: {
        title,
        content,
        author,
        description,
        metadata: {
          url: metadata?.sourceURL || url,
          publishedTime: metadata?.publishedTime,
          modifiedTime: metadata?.modifiedTime,
          keywords: metadata?.keywords,
          language: metadata?.language,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Scraping failed",
    };
  }
}
