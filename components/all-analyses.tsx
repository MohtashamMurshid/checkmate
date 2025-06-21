"use client";

import {
  useAllAnalyses,
  useAllAnalysisStats,
} from "../lib/hooks/use-all-analyses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, Calendar, User, Video } from "lucide-react";
import Link from "next/link";

export function AllAnalyses() {
  const analyses = useAllAnalyses();
  const stats = useAllAnalysisStats();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!analyses) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading all analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Requires Fact-Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.requiresFactCheck}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                News Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hasNewsContent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Verified False
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.factCheckSummary.verifiedFalse}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyses List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Saved Analyses</h2>

        {analyses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground">
                When analyses are created, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          analyses.map((analysis) => (
            <Card key={analysis._id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {analysis.metadata?.title || "TikTok Analysis"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      {analysis.metadata?.creator && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {analysis.metadata.creator}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.createdAt)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.requiresFactCheck && (
                      <Badge variant="destructive">Needs Fact-Check</Badge>
                    )}
                    {analysis.newsDetection?.hasNewsContent && (
                      <Badge variant="secondary">News Content</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Transcription Preview */}
                {analysis.transcription?.text && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Transcription
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {analysis.transcription.text}
                    </p>
                  </div>
                )}

                {/* Fact-Check Summary */}
                {analysis.factCheck && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Fact-Check Summary
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.factCheck.summary?.verifiedTrue ?? 0) > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          {analysis.factCheck.summary?.verifiedTrue} True
                        </Badge>
                      )}
                      {(analysis.factCheck.summary?.verifiedFalse ?? 0) > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {analysis.factCheck.summary?.verifiedFalse} False
                        </Badge>
                      )}
                      {(analysis.factCheck.summary?.misleading ?? 0) > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {analysis.factCheck.summary?.misleading} Misleading
                        </Badge>
                      )}
                      {(analysis.factCheck.summary?.unverifiable ?? 0) > 0 && (
                        <Badge className="bg-gray-100 text-gray-800">
                          {analysis.factCheck.summary?.unverifiable}{" "}
                          Unverifiable
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/news/${analysis._id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
