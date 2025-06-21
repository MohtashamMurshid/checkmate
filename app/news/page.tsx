"use client";

import { SavedAnalyses } from "@/components/saved-analyses";

export default function NewsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Mock Data Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your TikTok fact-checking analyses
          </p>
        </div>
      </div>

      {/* Saved Analyses Component */}
      <SavedAnalyses />
    </div>
  );
}
