/**
 * AllAnalyses - Component for displaying a feed of all content analyses
 *
 * This component shows:
 * - A paginated list of all analyses
 * - Loading states
 * - Empty state when no analyses exist
 * - Load more functionality for infinite scroll
 */

"use client";

import { useAllAnalyses } from "../lib/hooks/use-all-analyses";
import { Button } from "./ui/button";
import { AnalysisCard, LoadingSpinner, EmptyState } from "./analysis";

/**
 * AllAnalyses component displays all content analyses in a feed format
 *
 * @example
 * ```tsx
 * <AllAnalyses />
 * ```
 */
export function AllAnalyses() {
  const { analyses, isLoading, hasMore, isLoadingMore, loadMore } =
    useAllAnalyses();

  // Show loading spinner while initial data loads
  if (isLoading) {
    return <LoadingSpinner message="Loading analyses..." />;
  }

  return (
    <div className="space-y-0">
      {analyses.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          description="Analyses will appear here once created."
        />
      ) : (
        analyses.map((analysis) => (
          <AnalysisCard key={analysis._id} analysis={analysis} />
        ))
      )}

      {/* Load More Button for infinite scroll */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            onClick={loadMore}
            variant="outline"
            className="w-full max-w-xs"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Loading spinner for additional content */}
      {isLoadingMore && (
        <LoadingSpinner message="Loading more..." size="sm" className="py-6" />
      )}
    </div>
  );
}
