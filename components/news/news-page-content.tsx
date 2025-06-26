/**
 * NewsPageContent - Client component for news page interactivity
 *
 * This component handles all client-side functionality for the news page,
 * allowing the page component to remain a server component.
 */

"use client";

import { AllAnalyses } from "@/components/all-analyses";
import { useLanguage } from "@/components/language-provider";
import {
  TopCredibleSources,
  TopMisinformationSources,
} from "@/components/news";

/**
 * Props for the NewsPageContent component
 */
interface NewsPageContentProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * NewsPageContent component handles the client-side functionality
 * for the news page, including language translations and interactive components
 *
 * @example
 * ```tsx
 * <NewsPageContent />
 * ```
 */
export const NewsPageContent = ({ className }: NewsPageContentProps) => {
  const { t } = useLanguage();

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 ${className || ""}`}
    >
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
};
