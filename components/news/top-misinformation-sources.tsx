/**
 * TopMisinformationSources - Component for displaying content creators with low credibility
 * Uses the reusable CreatorSourcesCard component with misinformation sources configuration
 */

"use client";

import { XCircle } from "lucide-react";
import { useMisinformationSources } from "@/lib/hooks/use-credible-sources";
import { CreatorSourcesCard } from "./creator-sources-card";

/**
 * Props for the TopMisinformationSources component
 */
interface TopMisinformationSourcesProps {
  /** Platform to filter sources by (optional) */
  platform?: string;
  /** Maximum number of sources to display */
  limit?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * TopMisinformationSources component displays content creators with
 * the lowest credibility ratings for awareness purposes
 *
 * @example
 * ```tsx
 * <TopMisinformationSources limit={5} />
 * <TopMisinformationSources platform="tiktok" limit={10} />
 * ```
 */
export const TopMisinformationSources = ({
  platform,
  limit = 5,
  className,
}: TopMisinformationSourcesProps) => {
  const misinformationSources = useMisinformationSources(platform, limit);

  return (
    <CreatorSourcesCard
      creators={misinformationSources}
      config={{
        icon: XCircle,
        titleKey: "topMisinformationSources",
        emptyMessageKey: "noMisinformationSources",
        variant: "misinformation",
      }}
      className={className}
    />
  );
};
