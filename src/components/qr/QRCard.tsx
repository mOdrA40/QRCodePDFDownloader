/**
 * QRCard Component
 * Optimized individual QR card component for virtualized list
 */

"use client";

import { Calendar, Copy, Download, MoreHorizontal, QrCode, Trash2 } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "../../app/files/files.module.css";

interface QRCardProps {
  qr: {
    _id: string;
    textContent: string;
    qrSettings: {
      format: string;
      size: number;
      errorCorrectionLevel: string;
    };
    createdAt: number;
  };
  onCopyText: (text: string) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onDelete: (qrId: string) => void;
  isDeleting?: boolean;
}

export const QRCard = memo(function QRCard({
  qr,
  onCopyText,
  onDownload,
  onDelete,
  isDeleting = false,
}: QRCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-all duration-300 w-full max-w-full overflow-hidden h-full ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <CardContent className="p-3 xs:p-4">
        <div className="flex items-start gap-2 xs:gap-3 lg:gap-4 w-full min-w-0">
          {/* QR Preview Placeholder  */}
          <div className="shrink-0 w-8 h-8 xs:w-10 xs:h-10 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center">
            <QrCode className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
          </div>

          {/* QR Details */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start gap-2 mb-2">
              <h3 className={`font-medium mb-2 leading-snug ${styles.safeText}`}>
                {qr.textContent.length > 40
                  ? `${qr.textContent.substring(0, 40)}...`
                  : qr.textContent}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {qr.qrSettings.format.toUpperCase()}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 text-xs xs:text-sm sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2 flex-wrap xs:flex-row xs:gap-4 lg:gap-6">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {new Date(qr.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {qr.qrSettings.size}px
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap xs:flex-row xs:gap-4 lg:gap-6">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {qr.qrSettings.errorCorrectionLevel} Error Correction
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 xs:h-9 xs:w-9">
                  <MoreHorizontal className="h-3 w-3 xs:h-4 xs:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCopyText(qr.textContent)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload("", qr.textContent)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(qr._id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
