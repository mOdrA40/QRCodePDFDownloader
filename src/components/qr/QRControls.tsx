/**
 * QR Controls Component
 * Handles input and basic QR configuration
 */

"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DragDropZone } from "@/components/drag-drop-zone";
import { useQRContext } from "@/contexts";

interface QRControlsProps {
  className?: string;
}

const sampleTexts = [
  "https://example.com",
  "Hello, World!",
  "mailto:contact@example.com",
  "tel:+1234567890",
  "Visit our website for more information!",
];

export function QRControls({ className }: QRControlsProps) {
  const { state, updateOption } = useQRContext();

  const handleTextChange = (text: string) => {
    updateOption("text", text);
  };

  const handleLogoUrlChange = (url: string) => {
    updateOption("logoUrl", url);
  };

  return (
    <Card className={`shadow-xl bg-card/80 backdrop-blur border-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Content & Text
        </CardTitle>
        <CardDescription>
          Enter the text or URL you want to encode in your QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="qr-text" className="text-sm font-medium">
            Text to Encode
          </Label>
          <Textarea
            id="qr-text"
            placeholder="Enter text, URL, or any content..."
            value={state.options.text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="mt-2 min-h-[100px] resize-none"
            suppressHydrationWarning
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Quick Samples
          </Label>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((sample) => (
              <Button
                key={sample}
                variant="outline"
                size="sm"
                onClick={() => handleTextChange(sample)}
                className="text-xs"
              >
                {sample.length > 20
                  ? `${sample.substring(0, 20)}...`
                  : sample}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="logo-url" className="text-sm font-medium">
            Logo URL (Optional)
          </Label>
          <Input
            id="logo-url"
            type="url"
            placeholder="https://example.com/logo.png"
            value={state.options.logoUrl}
            onChange={(e) => handleLogoUrlChange(e.target.value)}
            className="mt-2"
            suppressHydrationWarning
          />
        </div>

        <DragDropZone 
          onTextExtracted={handleTextChange}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}
