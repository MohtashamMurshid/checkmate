// Export individual tools
export { detectNewsContent } from "./news-detection";
export { researchAndFactCheck } from "./web-research";
export { generateCredibilityReport } from "./credibility-report";

// Export utility functions
export { evaluateDomainCredibility } from "./domain-credibility";
export { analyzeVerificationStatus } from "./verification-analysis";

// Import tools for array export
import { detectNewsContent } from "./news-detection";
import { researchAndFactCheck } from "./web-research";
import { generateCredibilityReport } from "./credibility-report";

/**
 * Array of fact-checking tools for easy use.
 */
export const factCheckingTools = [
  detectNewsContent,
  researchAndFactCheck,
  generateCredibilityReport,
];
