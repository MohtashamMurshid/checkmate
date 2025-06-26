/**
 * News Page - Server component for displaying trending analyses and creator sources
 *
 * This page shows:
 * - A feed of all analyses (main content)
 * - Top credible sources (sidebar)
 * - Top misinformation sources (sidebar)
 *
 * This is now a React Server Component that renders a client component
 * for interactivity while enabling better performance and SEO.
 */

import { Metadata } from "next";
import { NewsPageContent } from "@/components/news";

/**
 * Metadata for the news page
 */
export const metadata: Metadata = {
  title: "Trending News Analysis | Checkmate",
  description:
    "Discover trending content analyses, credible sources, and fact-checked information from across social media platforms.",
  keywords: [
    "news analysis",
    "fact checking",
    "content verification",
    "social media",
    "credibility",
  ],
};

/**
 * News page server component
 *
 * This server component provides better SEO, faster initial page loads,
 * and enables server-side rendering while delegating client interactions
 * to the NewsPageContent component.
 */
export default function NewsPage() {
  return <NewsPageContent />;
}
