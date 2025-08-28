"use client"

import React, { useEffect, useState, useCallback } from "react"
import { BarChart3, TrendingUp, Clock, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UsageStats {
  totalGenerated: number
  todayGenerated: number
  favoriteFormat: string
  averageSize: number
  lastUsed: string
}

export function UsageStats() {
  const [stats, setStats] = useState<UsageStats>({
    totalGenerated: 0,
    todayGenerated: 0,
    favoriteFormat: "PNG",
    averageSize: 512,
    lastUsed: "Never"
  })

  useEffect(() => {
    // Load stats from localStorage
    const storedStats = localStorage.getItem('qr-usage-stats')
    if (storedStats) {
      const parsedStats = JSON.parse(storedStats)
      setStats(parsedStats)
    }
  }, [])

  const updateStats = useCallback((format: string, size: number) => {
    const today = new Date().toDateString()
    const now = new Date().toLocaleString()

    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        totalGenerated: prevStats.totalGenerated + 1,
        todayGenerated: prevStats.lastUsed.includes(today)
          ? prevStats.todayGenerated + 1
          : 1,
        favoriteFormat: format,
        averageSize: Math.round((prevStats.averageSize + size) / 2),
        lastUsed: now
      }

      localStorage.setItem('qr-usage-stats', JSON.stringify(newStats))
      return newStats
    })
  }, [])

  // Expose updateStats function through a global reference
  React.useEffect(() => {
    // @ts-ignore - Global reference for parent components
    window.updateUsageStats = updateStats
    return () => {
      // @ts-ignore
      window.updateUsageStats = undefined
    }
  }, [updateStats])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Usage Statistics
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
              {stats.favoriteFormat}
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
  )
}
