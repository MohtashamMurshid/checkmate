import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";

// Hook to get all TikTok analyses from all users with client-side pagination
export function useAllAnalyses() {
  const [displayCount, setDisplayCount] = useState(10);
  const allAnalyses = useQuery(api.tiktokAnalyses.getAllAnalyses);

  const displayedAnalyses = useMemo(() => {
    if (!allAnalyses) return [];
    return allAnalyses.slice(0, displayCount);
  }, [allAnalyses, displayCount]);

  const hasMore = useMemo(() => {
    if (!allAnalyses) return false;
    return displayCount < allAnalyses.length;
  }, [allAnalyses, displayCount]);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  return {
    analyses: displayedAnalyses,
    isLoading: allAnalyses === undefined,
    hasMore,
    isLoadingMore: false,
    loadMore,
  };
}

// Hook to get analysis statistics from all users
export function useAllAnalysisStats() {
  return useQuery(api.tiktokAnalyses.getAllAnalysisStats);
}
