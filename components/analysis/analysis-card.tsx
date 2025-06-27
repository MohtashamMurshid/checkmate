/**
 * AnalysisCard - Component for displaying individual analysis items
 * Used in the analyses feed to show content analysis results
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

/**
 * Analysis data interface
 */
interface Analysis {
  _id: string;
  createdAt: number;
  metadata?: {
    creator?: string;
    title?: string;
  };
  transcription?: {
    text?: string;
  };
  factCheck?: {
    verdict?: string;
  };
  creatorCredibilityRating?: number;
}

/**
 * Props for the AnalysisCard component
 */
interface AnalysisCardProps {
  /** Analysis data to display */
  analysis: Analysis;
  /** Optional CSS class name */
  className?: string;
}

/**
 * CreatorCredibilityBadge - Component for displaying creator credibility rating
 */
interface CreatorCredibilityBadgeProps {
  rating: number;
}

const CreatorCredibilityBadge = ({ rating }: CreatorCredibilityBadgeProps) => {
  const getBadgeClass = () => {
    if (rating > 7) {
      return "bg-green-100 text-green-800";
    } else if (rating >= 4) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass()}`}
    >
      Creator Credibility: {rating.toFixed(1)}
    </span>
  );
};

/**
 * AnalysisActions - Component for analysis action buttons
 */
interface AnalysisActionsProps {
  analysisId: string;
}

const AnalysisActions = ({ analysisId }: AnalysisActionsProps) => (
  <div className="flex justify-end items-center mt-4">
    <Link href={`/news/${analysisId}`} passHref>
      <Button variant="outline" size="sm">
        View Details
      </Button>
    </Link>
  </div>
);

/**
 * Formats timestamp to readable date string
 */
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * AnalysisCard component displays a single analysis item in a card format
 *
 * @example
 * ```tsx
 * <AnalysisCard analysis={analysisData} />
 * ```
 */
export const AnalysisCard = ({ analysis, className }: AnalysisCardProps) => {
  return (
    <Link href={`/news/${analysis._id}`} className="block">
      <Card
        className={`rounded-none border-x-0 border-t-0 first:border-t hover:bg-muted/50 cursor-pointer ${className || ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Creator Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header with creator info and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {analysis.metadata?.creator || "Anonymous"}
                  </span>

                  {/* Special verification badge for specific analysis */}
                  {analysis._id === "k97cr8dzekgww62mg1ktwkwbjd7jb6b9" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="https://www.rmp.gov.my/soal_selidik.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge
                            variant="outline"
                            className="ml-1 border-blue-500 text-blue-500"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Govt Verified
                          </Badge>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This creator is a verified government source.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <span className="text-sm text-muted-foreground">
                    @{analysis.metadata?.creator?.toLowerCase() || "user"}·{" "}
                    {formatDate(analysis.createdAt)}
                  </span>
                </div>

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Title */}
              <p className="text-sm text-foreground my-2">
                {analysis.metadata?.title || "TikTok Analysis"}
              </p>

              {/* Transcription Preview */}
              {analysis.transcription?.text && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {analysis.transcription.text}
                </p>
              )}

              {/* Analysis Badges */}
              <div className="flex items-center gap-3 mt-2">
                {analysis.factCheck?.verdict && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {analysis.factCheck.verdict.charAt(0).toUpperCase() +
                      analysis.factCheck.verdict.slice(1)}
                  </span>
                )}

                {typeof analysis.creatorCredibilityRating === "number" && (
                  <CreatorCredibilityBadge
                    rating={analysis.creatorCredibilityRating}
                  />
                )}
              </div>

              {/* Actions */}
              <AnalysisActions analysisId={analysis._id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
