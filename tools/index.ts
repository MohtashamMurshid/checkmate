// Re-export all tools from modular files
export * from "./helpers";
export * from "./content-analysis";
export * from "./fact-checking";

// Import all tools for convenience arrays
import { contentAnalysisTools } from "./content-analysis";
import { factCheckingTools } from "./fact-checking";

/**
 * Combined array of all content analysis tools for easy use.
 * @type {import("ai").Tool[]}
 */
export const allContentAnalysisTools = [...contentAnalysisTools];

/**
 * Combined array of all fact-checking tools.
 * @type {import("ai").Tool[]}
 */
export const allFactCheckingTools = [...factCheckingTools];

/**
 * All available tools combined for comprehensive analysis.
 * @type {import("ai").Tool[]}
 */
export const allTools = [...contentAnalysisTools, ...factCheckingTools];
