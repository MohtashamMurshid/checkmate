/**
 * CreatorSourcesCard - A reusable component for displaying creator sources
 * Can be configured to show either credible sources or misinformation sources
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

/**
 * Interface for creator data used in the component
 */
interface Creator {
  creatorId: string;
  creatorName?: string;
  platform: string;
  credibilityRating: number;
}

/**
 * Configuration interface for the component
 */
interface CreatorSourcesCardConfig {
  /** The icon component to display in the header */
  icon: LucideIcon;
  /** The title translation key */
  titleKey: keyof ReturnType<typeof useLanguage>["t"];
  /** The empty state message translation key */
  emptyMessageKey: keyof ReturnType<typeof useLanguage>["t"];
  /** Color scheme for the component ('credible' or 'misinformation') */
  variant: "credible" | "misinformation";
}

/**
 * Props for the CreatorSourcesCard component
 */
interface CreatorSourcesCardProps {
  /** Array of creators to display */
  creators: Creator[] | undefined;
  /** Component configuration */
  config: CreatorSourcesCardConfig;
  /** Optional CSS class name */
  className?: string;
}

/**
 * LoadingSkeleton - Component for loading state
 */
const LoadingSkeleton = () => (
  <>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    ))}
  </>
);

/**
 * CreatorItem - Individual creator display component
 */
interface CreatorItemProps {
  creator: Creator;
  variant: "credible" | "misinformation";
  onViewDetails: (creator: Creator) => void;
  viewDetailsText: string;
}

const CreatorItem = ({
  creator,
  variant,
  onViewDetails,
  viewDetailsText,
}: CreatorItemProps) => {
  const avatarConfig =
    variant === "credible"
      ? {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          ratingColor: "text-green-600",
        }
      : {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          ratingColor: "text-red-600",
        };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full ${avatarConfig.bgColor} ${avatarConfig.textColor} flex items-center justify-center font-bold text-lg`}
        >
          {(creator.creatorName || creator.creatorId).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold">
            {creator.creatorName || creator.creatorId}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="capitalize">{creator.platform}</span>
            <span>•</span>
            <span className={`${avatarConfig.ratingColor} font-medium`}>
              {creator.credibilityRating.toFixed(1)}/10
            </span>
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewDetails(creator)}
      >
        {viewDetailsText}
      </Button>
    </div>
  );
};

/**
 * CreatorSourcesCard - Main component for displaying creator sources
 *
 * @example
 * ```tsx
 * <CreatorSourcesCard
 *   creators={credibleCreators}
 *   config={{
 *     icon: CheckCircle,
 *     titleKey: 'topCredibleSources',
 *     emptyMessageKey: 'noCredibleSources',
 *     variant: 'credible'
 *   }}
 * />
 * ```
 */
export const CreatorSourcesCard = ({
  creators,
  config,
  className = "",
}: CreatorSourcesCardProps) => {
  const router = useRouter();
  const { t } = useLanguage();

  const { icon: Icon, titleKey, emptyMessageKey, variant } = config;

  /**
   * Handles navigation to creator details page
   */
  const handleViewDetails = (creator: Creator) => {
    router.push(
      `/creator/${encodeURIComponent(creator.creatorId)}?platform=${creator.platform}`
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {t[titleKey] as string}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {creators === undefined ? (
          <LoadingSkeleton />
        ) : creators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t[emptyMessageKey] as string}
          </p>
        ) : (
          creators.map((creator) => (
            <CreatorItem
              key={`${creator.creatorId}-${creator.platform}`}
              creator={creator}
              variant={variant}
              onViewDetails={handleViewDetails}
              viewDetailsText={t.viewDetails}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
