/**
 * CreatorSummary - Component for displaying creator profile summary
 *
 * Shows creator information including credibility rating, total analyses,
 * and last analyzed date.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Calendar } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Creator data interface
 */
export interface Creator {
  _id: string;
  creatorId: string;
  platform: string;
  creatorName?: string;
  credibilityRating: number;
  totalAnalyses: number;
  lastAnalyzedAt: number;
}

/**
 * Props for the CreatorSummary component
 */
interface CreatorSummaryProps {
  /** Creator data to display */
  creator: Creator | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * CreatorSummary component displays creator profile information
 *
 * @example
 * ```tsx
 * <CreatorSummary creator={creatorData} />
 * ```
 */
export const CreatorSummary = ({ creator, className }: CreatorSummaryProps) => {
  const { t } = useLanguage();

  if (!creator) return null;

  /**
   * Gets the appropriate color class for credibility rating
   */
  const getCredibilityColor = (rating: number): string => {
    if (rating >= 7) return "text-green-600 bg-green-100";
    if (rating >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  /**
   * Gets the localized credibility label
   */
  const getCredibilityLabel = (rating: number): string => {
    if (rating >= 7) return t.highlyCredible;
    if (rating >= 4) return t.moderatelyCredible;
    return t.lowCredibility;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg font-bold">
              {(creator.creatorName || creator.creatorId)
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">
              {creator.creatorName || creator.creatorId}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {creator.platform} {t.creator}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">{t.credibilityRating}</span>
            </div>
            <Badge
              variant="secondary"
              className={`${getCredibilityColor(creator.credibilityRating)} border-0`}
            >
              {creator.credibilityRating.toFixed(1)}/10 -{" "}
              {getCredibilityLabel(creator.credibilityRating)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">{t.totalAnalyses}</span>
            </div>
            <Badge variant="outline">
              {creator.totalAnalyses} {t.analyses}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{t.lastAnalyzed}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(creator.lastAnalyzedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
