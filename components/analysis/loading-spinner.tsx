/**
 * LoadingSpinner - Reusable loading spinner component
 * Used across the application for consistent loading states
 */

import React from "react";

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Optional CSS class name */
  className?: string;
}

/**
 * LoadingSpinner component displays a consistent loading state
 *
 * @example
 * ```tsx
 * <LoadingSpinner message="Loading analyses..." />
 * <LoadingSpinner size="lg" />
 * ```
 */
export const LoadingSpinner = ({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-4 ${sizeClasses[size]}`}
        />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
