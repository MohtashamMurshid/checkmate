import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Hook to get all TikTok analyses from all users
export function useAllAnalyses() {
  return useQuery(api.tiktokAnalyses.getAllAnalyses);
}

// Hook to get analysis statistics from all users
export function useAllAnalysisStats() {
  return useQuery(api.tiktokAnalyses.getAllAnalysisStats);
}
