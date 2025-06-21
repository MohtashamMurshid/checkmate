"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  useContentCreator,
  useTopCreatorsByCredibility,
} from "@/lib/hooks/use-saved-analyses";

interface CreatorCredibilityDisplayProps {
  creatorId: string;
  platform: string;
  showDetails?: boolean;
}

export function CreatorCredibilityDisplay({
  creatorId,
  platform,
  showDetails = true,
}: CreatorCredibilityDisplayProps) {
  const creator = useContentCreator(creatorId, platform);

  if (!creator) {
    return null;
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (rating >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (rating >= 4) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 6) return <TrendingUp className="h-4 w-4" />;
    if (rating >= 4) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8) return "Highly Credible";
    if (rating >= 6) return "Credible";
    if (rating >= 4) return "Moderate";
    return "Low Credibility";
  };

  if (!showDetails) {
    return (
      <Badge
        className={`${getRatingColor(creator.credibilityRating)} flex items-center gap-1`}
      >
        {getRatingIcon(creator.credibilityRating)}
        {creator.credibilityRating.toFixed(1)}/10
      </Badge>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Creator Credibility Rating
        </CardTitle>
        <CardDescription>
          Based on {creator.totalAnalyses} analyzed{" "}
          {creator.totalAnalyses === 1 ? "post" : "posts"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {creator.credibilityRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
            {getRatingIcon(creator.credibilityRating)}
          </div>
          <Badge className={getRatingColor(creator.credibilityRating)}>
            {getRatingLabel(creator.credibilityRating)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Credibility Score</span>
            <span>{(creator.credibilityRating * 10).toFixed(0)}%</span>
          </div>
          <Progress value={creator.credibilityRating * 10} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Platform</span>
            <p className="font-medium capitalize">{creator.platform}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Analyses</span>
            <p className="font-medium">{creator.totalAnalyses}</p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(creator.lastAnalyzedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}

interface TopCreatorsListProps {
  platform?: string;
  limit?: number;
}

export function TopCreatorsList({
  platform,
  limit = 10,
}: TopCreatorsListProps) {
  const topCreators = useTopCreatorsByCredibility(platform, limit);

  if (!topCreators || topCreators.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No creators with sufficient data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Credible Creators</CardTitle>
        <CardDescription>
          {platform
            ? `Top creators on ${platform}`
            : "Top creators across all platforms"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCreators.map((creator, index) => (
            <div
              key={`${creator.platform}-${creator.creatorId}`}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium">
                    {creator.creatorName || creator.creatorId}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {creator.platform}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {creator.totalAnalyses}{" "}
                  {creator.totalAnalyses === 1 ? "post" : "posts"}
                </span>
                <CreatorCredibilityDisplay
                  creatorId={creator.creatorId}
                  platform={creator.platform}
                  showDetails={false}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
