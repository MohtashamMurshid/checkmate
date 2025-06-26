/**
 * NewsPageContent - Client component for news page
 *
 * This component handles all the news page functionality including layout
 * and client-side interactivity.
 */

"use client";

import { useLanguage } from "@/components/language-provider";
import { NewsLayout } from "./news-layout";

/**
 * Props for the NewsPageContent component
 */
interface NewsPageContentProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * NewsPageContent component handles the news page layout and functionality
 *
 * @example
 * ```tsx
 * <NewsPageContent />
 * ```
 */
export const NewsPageContent = ({ className }: NewsPageContentProps) => {
  const { t } = useLanguage();

  return <NewsLayout title={t.trendingOnCheckmate} className={className} />;
};
