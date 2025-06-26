/**
 * News Page - Main page for displaying trending analyses and creator sources
 *
 * This page shows:
 * - A feed of all analyses (main content)
 * - Top credible sources (sidebar)
 * - Top misinformation sources (sidebar)
 */

"use client";

import { AllAnalyses } from "@/components/all-analyses";
import { useLanguage } from "@/components/language-provider";
import {
  TopCredibleSources,
  TopMisinformationSources,
} from "@/components/news";

export default function NewsPage() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      {/* Main Content Feed */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">{t.trendingOnCheckmate}</h1>
        <AllAnalyses />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 hidden md:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pt-15">
        <TopCredibleSources />
        <TopMisinformationSources />
      </div>
    </div>
  );
}
