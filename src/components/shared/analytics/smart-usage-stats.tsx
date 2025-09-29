/**
 * Smart Usage Statistics Component
 * Automatically switches between local storage and Convex database based on authentication
 */

"use client";

import { useConvexAuth } from "convex/react";
import { memo } from "react";
import { ConvexUsageStats } from "./convex-usage-stats";
import { UsageStats } from "./usage-stats";

interface SmartUsageStatsProps {
  className?: string;
}

export const SmartUsageStats = memo(function SmartUsageStats({ className }: SmartUsageStatsProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <UsageStats className={className || ""} />;
  }

  // Use Convex stats for authenticated users, local stats for guests
  if (isAuthenticated) {
    return <ConvexUsageStats className={className || ""} />;
  }

  return <UsageStats className={className || ""} />;
});
