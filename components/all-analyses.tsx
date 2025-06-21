"use client";

import { useAllAnalyses } from "../lib/hooks/use-all-analyses";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal, User } from "lucide-react";
import Link from "next/link";

const TweetActions = ({ analysisId }: { analysisId: string }) => (
  <div className="flex justify-end items-center mt-4">
    <Link href={`/news/${analysisId}`} passHref>
      <Button variant="outline" size="sm">
        View Details
      </Button>
    </Link>
  </div>
);

export function AllAnalyses() {
  const { analyses, isLoading, hasMore, isLoadingMore, loadMore } =
    useAllAnalyses();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {analyses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground">
              Analyses will appear here once created.
            </p>
          </CardContent>
        </Card>
      ) : (
        analyses.map((analysis) => (
          <Link
            key={analysis._id}
            href={`/news/${analysis._id}`}
            className="block"
          >
            <Card className="rounded-none border-x-0 border-t-0 first:border-t hover:bg-muted/50 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {analysis.metadata?.creator || "Anonymous"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @{analysis.metadata?.creator?.toLowerCase() || "user"}
                          · {formatDate(analysis.createdAt)}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-foreground my-2">
                      {analysis.metadata?.title || "TikTok Analysis"}
                    </p>

                    {analysis.transcription?.text && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {analysis.transcription.text}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.requiresFactCheck && (
                        <Badge variant="destructive">Needs Fact-Check</Badge>
                      )}
                      {analysis.newsDetection?.hasNewsContent && (
                        <Badge variant="secondary">News Content</Badge>
                      )}
                    </div>

                    <TweetActions analysisId={analysis._id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading more...</p>
          </div>
        </div>
      )}
    </div>
  );
}
