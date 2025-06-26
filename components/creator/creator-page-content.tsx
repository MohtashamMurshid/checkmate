/**
 * CreatorPageContent - Client component for creator page functionality
 *
 * This component handles all client-side functionality for the creator page,
 * allowing the page component to remain a server component.
 */

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLanguage } from "@/components/language-provider";
import { CreatorSummary, CreatorAnalyses } from "@/components/creator";
import { LoadingSpinner, EmptyState } from "@/components/analysis";

/**
 * Props for the CreatorPageContent component
 */
interface CreatorPageContentProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * CreatorPageContent component handles the client-side functionality
 * for the creator page, including data fetching and interactions
 *
 * @example
 * ```tsx
 * <CreatorPageContent />
 * ```
 */
export const CreatorPageContent = ({ className }: CreatorPageContentProps) => {
  const { t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();

  const creatorId = decodeURIComponent(params.creatorId as string);
  const platform = searchParams.get("platform") || "tiktok";

  // Fetch creator data
  const creator = useQuery(api.tiktokAnalyses.getCreatorSummary, {
    creatorId,
    platform,
  });

  // Handle loading state
  if (creator === undefined) {
    return <LoadingSpinner message={t.loadingAnalysis} />;
  }

  // Handle creator not found
  if (creator === null) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12 text-muted-foreground" />}
          title={t.creatorNotFound}
          description={t.creatorNotFoundMessage}
          action={
            <Button variant="outline" onClick={() => window.history.back()}>
              {t.backToNews}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className || ""}`}>
      {/* Creator Summary */}
      <CreatorSummary creator={creator} />

      {/* Creator Analyses */}
      <CreatorAnalyses
        creatorId={creatorId}
        platform={platform}
        className="mt-6"
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          {t.backToAllAnalyses}
        </Button>

        {creator.creatorName && (
          <Button
            variant="outline"
            onClick={() => {
              const url =
                platform === "tiktok"
                  ? `https://www.tiktok.com/@${creator.creatorName}`
                  : `https://twitter.com/${creator.creatorName}`;
              window.open(url, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t.viewOriginalVideo}
          </Button>
        )}
      </div>
    </div>
  );
};
