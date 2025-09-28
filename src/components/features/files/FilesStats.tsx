/**
 * Files Stats Component
 * Wrapper component for QR history statistics section
 */

"use client";

import { memo } from "react";
import { QRHistoryStats } from "@/components/features/qr/history";

export const FilesStats = memo(function FilesStats() {
  return (
    <div className="mb-6 xs:mb-8">
      <QRHistoryStats />
    </div>
  );
});
