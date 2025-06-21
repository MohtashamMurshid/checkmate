"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Calendar,
  BarChart3,
  MessageSquare,
  Send,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

type Creator = {
  _id: string;
  creatorId: string;
  platform: string;
  creatorName?: string;
  credibilityRating: number;
  totalAnalyses: number;
  lastAnalyzedAt: number;
};

// Creator Summary Component
const CreatorSummary = ({ creator }: { creator: Creator }) => {
  if (!creator) return null;

  const getCredibilityColor = (rating: number) => {
    if (rating >= 7) return "text-green-600 bg-green-100";
    if (rating >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getCredibilityLabel = (rating: number) => {
    if (rating >= 7) return "Highly Credible";
    if (rating >= 4) return "Moderately Credible";
    return "Low Credibility";
  };

  return (
    <Card>
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
              {creator.platform} Creator
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">Credibility Rating</span>
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
              <span className="text-sm font-medium">Total Analyses</span>
            </div>
            <Badge variant="outline">{creator.totalAnalyses} analyses</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Last Analyzed</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(creator.lastAnalyzedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Creator Analyses Component
const CreatorAnalyses = ({
  creatorId,
  platform,
}: {
  creatorId: string;
  platform: string;
}) => {
  const analyses = useQuery(api.tiktokAnalyses.getAnalysesByCreator, {
    creatorId,
    platform,
    limit: 10,
  });

  const getVerdictColor = (verdict?: string) => {
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

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Content Analyses ({analyses?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyses === undefined ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No analyses found for this creator yet.
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
                      {analysis.metadata?.title || "Untitled Video"}
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
                      Confidence: {analysis.factCheck?.confidence || 0}%
                    </span>
                    {analysis.creatorCredibilityRating && (
                      <span className="whitespace-nowrap">
                        • Rating: {analysis.creatorCredibilityRating.toFixed(1)}
                        /10
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => window.open(analysis.videoUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Comments Component
const CreatorComments = ({
  creatorId,
  platform,
}: {
  creatorId: string;
  platform: string;
}) => {
  const [newComment, setNewComment] = useState("");

  const comments = useQuery(api.tiktokAnalyses.getCreatorComments, {
    creatorId,
    platform,
    limit: 20,
  });

  const addComment = useMutation(api.tiktokAnalyses.addCreatorComment);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        creatorId,
        platform,
        content: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment submission */}
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts about this creator..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => {
              const displayName =
                comment.user?.firstName ||
                comment.user?.username ||
                "Anonymous";
              return (
                <div
                  key={comment._id}
                  className="border-b pb-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CreatorDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const creatorId = decodeURIComponent(params.creatorId as string);
  const platform = searchParams.get("platform") || "";

  // Fetch creator data
  const creator = useQuery(api.tiktokAnalyses.getContentCreator, {
    creatorId,
    platform,
  });

  if (creator === undefined) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
            <p className="text-muted-foreground">
              The content creator &ldquo;{creatorId}&rdquo; on {platform} could
              not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Creator Info & Analyses */}
        <div className="lg:col-span-2 space-y-6">
          <CreatorSummary creator={creator} />
          <CreatorAnalyses creatorId={creatorId} platform={platform} />
        </div>

        {/* Right Column - Comments */}
        <div>
          <CreatorComments creatorId={creatorId} platform={platform} />
        </div>
      </div>
    </div>
  );
}
