/**
 * EmptyState - Reusable empty state component
 * Used when no data is available to display
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Props for the EmptyState component
 */
interface EmptyStateProps {
  /** Title to display */
  title: string;
  /** Description message */
  description: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional action component */
  action?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * EmptyState component displays a consistent empty state message
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No analyses yet"
 *   description="Analyses will appear here once created."
 * />
 * ```
 */
export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-8 text-center">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {action && action}
      </CardContent>
    </Card>
  );
};
