"use client";

import { BarChart3, Clock, TrendingUp, Zap } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUsageStats } from "@/hooks";

interface UsageStatsProps {
  className?: string;
}

export const UsageStats = memo(function UsageStats({
  className,
}: UsageStatsProps) {
  const { stats, isLoading, error } = useUsageStats();

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (error) {
    return (
      <Card
        className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}
      >
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p className="text-sm">Failed to load usage statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Usage Statistics
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600" />
          )}
        </CardTitle>
        <CardDescription>
          Track your QR code generation activity
        </CardDescription>
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
            <div className="text-2xl font-bold text-green-600">
              {stats.todayGenerated}
            </div>
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
            <div className="text-lg font-semibold text-muted-foreground">
              {stats.averageSize}px
            </div>
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
