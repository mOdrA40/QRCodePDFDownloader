/**
 * QR History Statistics Component
 * Displays user's QR generation statistics
 */

"use client";

import { useQuery } from "convex/react";
import { Activity, BarChart3, Calendar, FileImage, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

export function QRHistoryStats() {
  const stats = useQuery(api.qrHistory.getQRStatistics);

  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => i).map((index) => (
          <Card key={`stats-skeleton-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Unable to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Generated",
      value: stats.totalGenerated.toLocaleString(),
      description: "QR codes created",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Today",
      value: stats.todayGenerated.toLocaleString(),
      description: "Generated today",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Favorite Format",
      value: stats.favoriteFormat.toUpperCase(),
      description: "Most used format",
      icon: FileImage,
      color: "text-purple-600",
    },
    {
      title: "Last Used",
      value: stats.lastUsed,
      description: "Most recent activity",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={`stat-${stat.title}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Format Usage Breakdown */}
      {Object.keys(stats.formatUsage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Format Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.formatUsage).map(([format, count]) => (
                <Badge key={format} variant="secondary" className="text-sm">
                  {format.toUpperCase()}: {String(count)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
