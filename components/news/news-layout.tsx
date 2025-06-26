/**
 * NewsLayout - Server component for news page layout
 *
 * This component handles only the layout structure and can remain
 * a server component for better performance.
 */

import { AllAnalyses } from "@/components/all-analyses";
import {
  TopCredibleSources,
  TopMisinformationSources,
} from "@/components/news";

/**
 * Props for the NewsLayout component
 */
interface NewsLayoutProps {
  /** The title to display */
  title: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * NewsLayout component handles the layout structure for the news page
 * This can remain a server component for better performance
 *
 * @example
 * ```tsx
 * <NewsLayout title="Trending News" />
 * ```
 */
export const NewsLayout = ({ title, className }: NewsLayoutProps) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 ${className || ""}`}
    >
      {/* Main Content Feed */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">{title}</h1>
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
