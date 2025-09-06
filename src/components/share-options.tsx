"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, ExternalLink, Mail, MessageCircle, Share2 } from "lucide-react";
import React, { memo, useCallback } from "react";
import { toast } from "sonner";

interface ShareOptionsProps {
  qrDataUrl: string;
  qrText: string;
  className?: string;
}

export const ShareOptions = memo(function ShareOptions({
  qrDataUrl,
  qrText,
  className,
}: ShareOptionsProps) {
  const shareToEmail = useCallback(() => {
    const subject = "QR Code Generated";
    const body = `Check out this QR code I generated! It contains: ${qrText}\n\nGenerated with QR PDF Generator`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
    toast.success("Email client opened!");
  }, [qrText]);

  const shareToWhatsApp = useCallback(() => {
    const text = `Check out this QR code I generated! It contains: ${qrText}\n\nGenerated with QR PDF Generator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    toast.success("WhatsApp opened!");
  }, [qrText]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrText);
      toast.success("QR code content copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = qrText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("QR code content copied to clipboard!");
      } catch (fallbackErr) {
        toast.error("Failed to copy to clipboard");
      }
    }
  }, [qrText]);

  const shareViaWebAPI = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "QR Code Generated",
          text: `Check out this QR code: ${qrText}`,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Sharing failed");
        }
      }
    } else {
      toast.error("Web Share API not supported");
    }
  }, [qrText]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full ${className || ""}`}
          disabled={!qrDataUrl || !qrText.trim()}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share QR Code</DialogTitle>
          <DialogDescription>
            Share your QR code with others through various platforms
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Button
            onClick={shareToEmail}
            variant="outline"
            className="justify-start"
            disabled={!qrText.trim()}
          >
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </Button>

          <Button
            onClick={shareToWhatsApp}
            variant="outline"
            className="justify-start"
            disabled={!qrText.trim()}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share to WhatsApp
          </Button>

          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="justify-start"
            disabled={!qrText.trim()}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Content
          </Button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              onClick={shareViaWebAPI}
              variant="outline"
              className="justify-start"
              disabled={!qrText.trim()}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share via System
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
