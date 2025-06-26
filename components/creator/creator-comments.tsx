/**
 * CreatorComments - Component for displaying and managing creator comments
 *
 * Handles comment display, submission, and real-time updates for creator pages.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { useUser } from "@clerk/nextjs";

/**
 * Props for the CreatorComments component
 */
interface CreatorCommentsProps {
  /** Creator ID for the comments */
  creatorId: string;
  /** Platform of the creator */
  platform: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * CreatorComments component handles comment functionality for creator pages
 *
 * @example
 * ```tsx
 * <CreatorComments creatorId="creator123" platform="tiktok" />
 * ```
 */
export const CreatorComments = ({
  creatorId,
  platform,
  className,
}: CreatorCommentsProps) => {
  const { t } = useLanguage();
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = useQuery(api.users.getCreatorComments, {
    creatorId,
    platform,
  });

  const submitComment = useMutation(api.users.addCreatorComment);

  /**
   * Handles comment submission
   */
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitComment({
        creatorId,
        platform,
        comment: newComment.trim(),
        userId: user.id,
        userName: user.firstName || user.username || "Anonymous",
      });
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t.communityComments} ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder={t.shareThoughts}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Posting..." : t.postComment}
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments === undefined ? (
            // Loading state
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              {t.noCommentsYet}
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(comment.userName || t.anonymous).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {comment.userName || t.anonymous}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
