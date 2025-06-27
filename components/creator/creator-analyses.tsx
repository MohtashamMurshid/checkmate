/**
 * CreatorAnalyses - Component for displaying a creator's content analyses
 *
 * Shows a list of analyses performed on content from a specific creator,
 * including verdicts, confidence scores, and analysis details.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/components/language-provider";
import { LoadingSpinner } from "@/components/analysis";

/**
 * Props for the CreatorAnalyses component
 */
interface CreatorAnalysesProps {
  /** Creator ID to fetch analyses for */
  creatorId: string;
  /** Platform to filter analyses by */
  platform: string;
  /** Maximum number of analyses to display */
  limit?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * CreatorAnalyses component displays analyses for a specific creator
 *
 * @example
 * ```tsx
 * <CreatorAnalyses creatorId="creator123" platform="tiktok" limit={10} />
 * ```
 */
export const CreatorAnalyses = ({
  creatorId,
  platform,
  limit = 10,
  className,
}: CreatorAnalysesProps) => {
  const { t } = useLanguage();
  const analyses = useQuery(api.tiktokAnalyses.getAnalysesByCreator, {
    creatorId,
    platform,
    limit,
  });

  /**
   * Gets the appropriate color class for fact-check verdicts
   */
  const getVerdictColor = (verdict?: string): string => {
    switch (verdict) {
      case "true":
        return "text-green-600 bg-green-100";
      case "false":
        return "text-red-600 bg-red-100";
      case "misleading":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (analyses === undefined) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t.contentAnalyses}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner message="Loading analyses..." size="sm" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t.contentAnalyses} ({analyses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t.noAnalysesFound}
          </p>
        ) : (
          <div className="space-y-4 max-w-full">
            {analyses.map((analysis) => (
              <div
                key={analysis._id}
                className="border rounded-lg p-4 space-y-3 w-full overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {analysis.metadata?.title || t.untitledVideo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {analysis.factCheck?.verdict && (
                    <Badge
                      variant="secondary"
                      className={`${getVerdictColor(analysis.factCheck.verdict)} border-0 shrink-0`}
                    >
                      {analysis.factCheck.verdict}
                    </Badge>
                  )}
                </div>

                {analysis.factCheck?.explanation && (
                  <div className="max-w-full overflow-hidden">
                    <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                      {analysis.factCheck.explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="whitespace-nowrap">
                      {t.confidence}: {analysis.factCheck?.confidence || 0}%
                    </span>
                    {analysis.creatorCredibilityRating && (
                      <span className="whitespace-nowrap">
                        {t.rating}:{" "}
                        {analysis.creatorCredibilityRating.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
