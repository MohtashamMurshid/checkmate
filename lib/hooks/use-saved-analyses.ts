import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook to get all user's TikTok analyses
export function useUserTikTokAnalyses() {
  return useQuery(api.tiktokAnalyses.getUserTikTokAnalyses);
}

// Hook to get a specific analysis by ID
export function useTikTokAnalysisById(
  analysisId: Id<"tiktokAnalyses"> | undefined
) {
  return useQuery(
    api.tiktokAnalyses.getTikTokAnalysisById,
    analysisId ? { analysisId } : "skip"
  );
}

// Hook to get analyses that require fact-checking
export function useAnalysesRequiringFactCheck(limit?: number) {
  return useQuery(api.tiktokAnalyses.getAnalysesRequiringFactCheck, { limit });
}

// Hook to get user analysis statistics
export function useUserAnalysisStats() {
  return useQuery(api.tiktokAnalyses.getUserAnalysisStats);
}

// Hook to delete an analysis
export function useDeleteTikTokAnalysis() {
  return useMutation(api.tiktokAnalyses.deleteTikTokAnalysis);
}

// Hook to save a new analysis (alternative to API route)
export function useSaveTikTokAnalysis() {
  return useMutation(api.tiktokAnalyses.saveTikTokAnalysis);
}
