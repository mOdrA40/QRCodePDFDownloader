/**
 * Convex Usage Statistics Component
 * Displays user's QR generation statistics from Convex database
 */

"use client";

import { useQuery } from "convex/react";
import { BarChart3, Clock, TrendingUp, Zap } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

interface ConvexUsageStatsProps {
  className?: string;
}

export const ConvexUsageStats = memo(function ConvexUsageStats({
  className,
}: ConvexUsageStatsProps) {
  const stats = useQuery(api.qrHistory.getQRStatistics);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Loading state
  if (stats === undefined) {
    return (
      <Card className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Usage Statistics
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600" />
          </CardTitle>
          <CardDescription>Track your QR code generation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Generated</span>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Today</span>
              </div>
              <Skeleton className="h-8 w-12" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Favorite Format</span>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Last Used</span>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (stats === null) {
    return (
      <Card className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p className="text-sm">Failed to load usage statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use average size from database statistics
  const averageSize = stats.averageSize || 512;

  return (
    <Card className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Usage Statistics
        </CardTitle>
        <CardDescription>Track your QR code generation activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Generated</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.totalGenerated)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.todayGenerated}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Favorite Format</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {stats.favoriteFormat.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Avg. Size</span>
            </div>
            <div className="text-lg font-semibold text-muted-foreground">{averageSize}px</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last used: {stats.lastUsed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
