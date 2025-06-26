/**
 * TopCredibleSources - Component for displaying top credible content creators
 * Uses the reusable CreatorSourcesCard component with credible sources configuration
 */

"use client";

import { CheckCircle } from "lucide-react";
import { useCredibleSources } from "@/lib/hooks/use-credible-sources";
import { CreatorSourcesCard } from "./creator-sources-card";

/**
 * Props for the TopCredibleSources component
 */
interface TopCredibleSourcesProps {
  /** Platform to filter sources by (optional) */
  platform?: string;
  /** Maximum number of sources to display */
  limit?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * TopCredibleSources component displays the highest-rated content creators
 * for credibility and trustworthiness
 *
 * @example
 * ```tsx
 * <TopCredibleSources limit={5} />
 * <TopCredibleSources platform="tiktok" limit={10} />
 * ```
 */
export const TopCredibleSources = ({
  platform,
  limit = 5,
  className,
}: TopCredibleSourcesProps) => {
  const credibleSources = useCredibleSources(platform, limit);

  return (
    <CreatorSourcesCard
      creators={credibleSources}
      config={{
        icon: CheckCircle,
        titleKey: "topCredibleSources",
        emptyMessageKey: "noCredibleSources",
        variant: "credible",
      }}
      className={className}
    />
  );
};
