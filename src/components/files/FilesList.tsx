/**
 * Files List Component
 * Wrapper component for QR history list section
 */

"use client";

import { memo } from "react";
import { QRHistoryList } from "@/components/qr/QRHistoryList";

export const FilesList = memo(function FilesList() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <QRHistoryList />
    </div>
  );
});
