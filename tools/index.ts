// Re-export all tools from modular files
export * from "./helpers";
export * from "./tiktok-analysis";
export * from "./content-analysis";
export * from "./fact-checking";

// Import all tools for convenience arrays
import { tiktokAnalysisTools } from "./tiktok-analysis";
import { contentAnalysisTools } from "./content-analysis";
import { factCheckingTools } from "./fact-checking";
import { analyzeTikTokVideo, transcribeTikTokVideo } from "./tiktok-analysis";

/**
 * Combined array of all TikTok analysis tools for easy use.
 * @type {import("ai").Tool[]}
 */
export const allTiktokAnalysisTools = [
  ...tiktokAnalysisTools,
  ...contentAnalysisTools,
];

/**
 * Combined array of all fact-checking tools including TikTok analysis.
 * @type {import("ai").Tool[]}
 */
export const allFactCheckingTools = [
  analyzeTikTokVideo,
  transcribeTikTokVideo,
  ...factCheckingTools,
];

/**
 * All available tools combined for comprehensive analysis.
 * @type {import("ai").Tool[]}
 */
export const allTools = [
  ...tiktokAnalysisTools,
  ...contentAnalysisTools,
  ...factCheckingTools,
];
