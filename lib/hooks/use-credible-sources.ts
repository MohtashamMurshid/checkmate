import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useCredibleSources = (platform?: string, limit: number = 5) => {
  return useQuery(api.tiktokAnalyses.getTopCredibleSources, {
    platform,
    limit,
  });
};

export const useMisinformationSources = (
  platform?: string,
  limit: number = 5
) => {
  return useQuery(api.tiktokAnalyses.getTopMisinformationSources, {
    platform,
    limit,
  });
};
