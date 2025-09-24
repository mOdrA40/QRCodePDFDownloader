/**
 * QR Controls Component
 * Handles input and basic QR configuration
 */

"use client";

import { FileText, Zap } from "lucide-react";
import { useId } from "react";
import { DragDropZone } from "@/components/drag-drop-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const { state, updateOption, generateAndSaveQR } = useQRContext();
  const textId = useId();
  const logoUrlId = useId();

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
        <CardDescription>Enter the text or URL you want to encode in your QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={textId} className="text-sm font-medium">
            Text to Encode
          </Label>
          <Textarea
            id={textId}
            placeholder="Enter text, URL, or any content..."
            value={state.options.text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="mt-2 min-h-[100px] resize-none"
            suppressHydrationWarning={true}
          />

          {/* Generate QR Button - Explicit user action */}
          <div className="mt-3 flex justify-center">
            <Button
              onClick={generateAndSaveQR}
              disabled={!state.options.text.trim() || state.isGenerating}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Zap className="h-4 w-4 mr-2" />
              {state.isGenerating ? "Generating..." : "Generate QR Code"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click to generate and save QR code to your history
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Samples</Label>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((sample) => (
              <Button
                key={sample}
                variant="outline"
                size="sm"
                onClick={() => handleTextChange(sample)}
                className="text-xs"
              >
                {sample.length > 20 ? `${sample.substring(0, 20)}...` : sample}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor={logoUrlId} className="text-sm font-medium">
            Logo URL (Optional)
          </Label>
          <Input
            id={logoUrlId}
            type="url"
            placeholder="https://example.com/logo.png"
            value={state.options.logoUrl}
            onChange={(e) => handleLogoUrlChange(e.target.value)}
            className="mt-2"
            suppressHydrationWarning={true}
          />
        </div>

        <DragDropZone onTextExtracted={handleTextChange} className="mt-4" />
      </CardContent>
    </Card>
  );
}
