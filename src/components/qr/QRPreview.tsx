/**
 * QR Preview Component
 * Displays QR code preview with loading states
 */

"use client";

import { Image as ImageIcon, QrCode } from "lucide-react";
import Image from "next/image";
import { memo, type RefObject, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQRContext } from "@/contexts";
import { useIntersectionObserver } from "@/lib/performance";
import { qrService } from "@/services";

interface QRPreviewProps {
  className?: string;
}

export const QRPreview = memo(function QRPreview({
  className,
}: QRPreviewProps) {
  const { state } = useQRContext();
  const { options, isGenerating, progress } = state;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 }) as [
    RefObject<HTMLDivElement>,
    boolean,
  ];

  // Generate QR code when options change
  useEffect(() => {
    if (!options.text.trim() || !isIntersecting) {
      setQrDataUrl("");
      return;
    }

    const generateQR = async () => {
      setIsLoading(true);
      try {
        const result = await qrService.generateQRCode(options.text, {
          size: options.size,
          margin: options.margin,
          errorCorrectionLevel: options.errorCorrectionLevel,
          color: {
            dark: options.foreground,
            light: options.background,
          },
          format: "png",
        });
        setQrDataUrl(result.dataUrl);
      } catch (error) {
        console.error("QR generation failed:", error);
        setQrDataUrl("");
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [
    options.text,
    options.size,
    options.background,
    options.foreground,
    options.errorCorrectionLevel,
    options.margin,
    isIntersecting,
  ]);

  return (
    <Card
      className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}
      ref={ref}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-green-600" />
          QR Code Preview
          {options.text.trim() && (
            <span className="text-sm font-normal text-muted-foreground">
              ({options.size}×{options.size}px)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Real-time preview of your QR code
          {options.size > 600 && (
            <span className="block text-xs text-amber-600 mt-1">
              ⚠️ Large size - scroll to view full QR code
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="bg-muted/50 rounded-lg border-2 border-dashed border-border relative"
          style={{
            height: options.size > 600 ? "600px" : "auto",
            aspectRatio: options.size <= 600 ? "1" : "auto",
          }}
        >
          <div
            className="overflow-auto w-full h-full flex items-center justify-center p-4"
            style={{
              minHeight: options.size <= 600 ? "auto" : "600px",
            }}
          >
            {qrDataUrl && !isLoading ? (
              <div className="flex items-center justify-center" data-qr-preview>
                <Image
                  src={qrDataUrl}
                  alt="QR Code"
                  width={options.size}
                  height={options.size}
                  className="block max-w-full h-auto"
                  priority
                  unoptimized
                />
              </div>
            ) : options.text.trim() ? (
              <div className="text-center text-slate-400">
                <div className="animate-pulse bg-muted-foreground/20 w-32 h-32 mx-auto mb-4 rounded" />
                <p className="text-sm">Loading QR code...</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Enter text to generate QR code
                </p>
                <p className="text-sm">Your QR code will appear here</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-sm font-medium">Generating QR Code...</p>
                  <Progress value={progress} className="w-32 mt-2" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
