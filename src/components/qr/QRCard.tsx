/**
 * QRCard Component
 * Optimized individual QR card component for virtualized list
 */

"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Trash2, 
  Copy, 
  Calendar,
  QrCode,
  MoreHorizontal
} from "lucide-react";
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
}

export const QRCard = memo(function QRCard({ 
  qr, 
  onCopyText, 
  onDownload, 
  onDelete 
}: QRCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${styles.qrCard} h-full`}>
      <CardContent className="p-3 xs:p-4">
        <div className={styles.qrCardContent}>
          {/* QR Preview Placeholder */}
          <div className={`bg-muted rounded-lg flex items-center justify-center ${styles.qrPreview}`}>
            <QrCode className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
          </div>

          {/* QR Details */}
          <div className={styles.qrDetails}>
            <div className="flex items-start gap-2 mb-2">
              <h3 className={`font-medium ${styles.qrTitle} ${styles.safeText}`}>
                {qr.textContent.length > 40
                  ? `${qr.textContent.substring(0, 40)}...`
                  : qr.textContent}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {qr.qrSettings.format.toUpperCase()}
              </Badge>
            </div>

            <div className={styles.qrMeta}>
              <div className={styles.qrMetaRow}>
                <span className={styles.qrMetaItem}>
                  <Calendar className="h-3 w-3" />
                  {new Date(qr.createdAt).toLocaleDateString()}
                </span>
                <span className={styles.qrMetaItem}>
                  {qr.qrSettings.size}px
                </span>
              </div>
              <div className={styles.qrMetaRow}>
                <span className={styles.qrMetaItem}>
                  {qr.qrSettings.errorCorrectionLevel} Error Correction
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.qrActions}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
                <DropdownMenuItem
                  onClick={() => onDelete(qr._id)}
                  className="text-red-600"
                >
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
