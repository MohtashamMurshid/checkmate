/**
 * Creator Details Page - Server component for displaying creator information
 *
 * This page shows:
 * - Creator profile and credibility summary
 * - List of analyses for the creator's content
 * - Community comments and interactions
 *
 * This is now a React Server Component that renders a client component
 * for interactivity while enabling better performance and SEO.
 */

import { Metadata } from "next";
import { CreatorPageContent } from "@/components/creator";

/**
 * Generate dynamic metadata for creator pages
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ creatorId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { creatorId } = await params;
  const searchParamsData = await searchParams;
  const platform =
    typeof searchParamsData.platform === "string"
      ? searchParamsData.platform
      : "tiktok";

  const decodedCreatorId = decodeURIComponent(creatorId);

  return {
    title: `${decodedCreatorId} - Creator Analysis | Checkmate`,
    description: `View credibility analysis, fact-check results, and community insights for ${decodedCreatorId} on ${platform}.`,
    keywords: [
      "creator analysis",
      "fact checking",
      "credibility",
      platform,
      decodedCreatorId,
    ],
  };
}

/**
 * Creator page server component
 *
 * This server component provides better SEO, faster initial page loads,
 * and enables server-side rendering while delegating client interactions
 * to the CreatorPageContent component.
 */
export default function CreatorDetailsPage() {
  return <CreatorPageContent />;
}
