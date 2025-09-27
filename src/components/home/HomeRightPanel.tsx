/**
 * Home Right Panel Component
 * Contains QR preview, export options, and usage stats
 */

"use client";

import { QRExport, QRPreview } from "@/components/qr";
import { UsageStats } from "@/components/usage-stats";

export function HomeRightPanel() {
  return (
    <div className="space-y-6">
      <QRPreview />
      <QRExport />
      <UsageStats />
    </div>
  );
}
