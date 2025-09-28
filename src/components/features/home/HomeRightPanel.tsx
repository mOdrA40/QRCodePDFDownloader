/**
 * Home Right Panel Component
 * Contains QR preview, export options, and usage stats
 */

"use client";

import { QRExport } from "@/components/features/qr/export";
import { QRPreview } from "@/components/features/qr/preview";
import { UsageStats } from "@/components/shared/analytics";

export function HomeRightPanel() {
  return (
    <div className="space-y-6">
      <QRPreview />
      <QRExport />
      <UsageStats />
    </div>
  );
}
