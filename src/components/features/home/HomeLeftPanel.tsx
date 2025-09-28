/**
 * Home Left Panel Component
 * Contains QR controls, settings, and quick actions
 */

"use client";

import { QRControls, QRSettings, QuickActions } from "@/components/features/qr/controls";
import { useQRContext } from "@/contexts";

export function HomeLeftPanel() {
  const { updateOption } = useQRContext();

  const handleQuickAction = (text: string) => {
    updateOption("text", text);
  };

  return (
    <div className="space-y-6">
      <QRControls />
      <QRSettings />
      <QuickActions onQuickAction={handleQuickAction} />
    </div>
  );
}
