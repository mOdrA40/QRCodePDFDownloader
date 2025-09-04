"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareOptions } from "@/components/share-options";
import { DragDropZone } from "@/components/drag-drop-zone";
import { UsageStats } from "@/components/usage-stats";
import { QuickActions } from "@/components/quick-actions";
import {
  Download,
  QrCode,
  Settings,
  Palette,
  FileText,
  Image,
  Sparkles,
  Zap,
  Star,
  Heart,
} from "lucide-react";

interface QROptions {
  text: string;
  size: number;
  margin: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  foreground: string;
  background: string;
  format: "png" | "jpeg" | "webp";
  logoUrl?: string;
  logoSize?: number;
  logoBackground?: boolean;
  pdfPassword?: string;
  enablePdfPassword?: boolean;
}

export default function QRCodePDFDownloader() {
  const [qrOptions, setQROptions] = useState<QROptions>({
    text: "",
    size: 512,
    margin: 4,
    errorCorrectionLevel: "M",
    foreground: "#000000",
    background: "#ffffff",
    format: "png",
    logoUrl: "",
    logoSize: 60,
    logoBackground: false,
    pdfPassword: "",
    enablePdfPassword: false,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(true);
  const [savedPresets, setSavedPresets] = useState<{ name: string; options: QROptions }[]>([]);
  const [presetName, setPresetName] = useState("");
  const [isMounted, setIsMounted] = useState(false);


  // Fixed QR generation with proper DPI handling
  const generateQRCodeWithProperDPI = useCallback(async (text: string, options: {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: string;
    color?: { dark?: string; light?: string };
    format?: "png" | "jpeg" | "webp";
  }): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {


        // Create canvas with proper DPI scaling
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const size = options.size || 512;
        const dpr = window.devicePixelRatio || 1;
        const format = options.format || 'png';

        // Set actual canvas size (scaled for DPI)
        canvas.width = size * dpr;
        canvas.height = size * dpr;

        // Set display size (CSS pixels)
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        // Scale context to match DPI
        ctx.scale(dpr, dpr);



        // Generate QR using library but to our custom canvas
        QRCode.toCanvas(canvas, text, {
          width: size,
          margin: options.margin || 4,
          errorCorrectionLevel: 'M' as const,
          color: {
            dark: options.color?.dark || '#000000',
            light: options.color?.light || '#ffffff',
          },
        }).then(() => {
          // Convert to data URL with selected format
          const quality = 0.95; // High quality for JPEG/WebP

          let dataUrl: string;
          switch (format) {
            case 'jpeg':
              dataUrl = canvas.toDataURL('image/jpeg', quality);
              break;
            case 'webp':
              dataUrl = canvas.toDataURL('image/webp', quality);
              break;
            default:
              dataUrl = canvas.toDataURL('image/png');
              break;
          }

          resolve(dataUrl);
        }).catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const generateQRCode = useCallback(async () => {
    if (!qrOptions.text.trim()) {
      toast.error("Please enter text to generate QR code");
      return;
    }

    setIsGenerating(true);
    setDownloadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);



      // Generate with proper DPI handling
      const dataUrl = await generateQRCodeWithProperDPI(qrOptions.text, {
        size: qrOptions.size,
        margin: qrOptions.margin,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        format: qrOptions.format,
        color: {
          dark: qrOptions.foreground,
          light: qrOptions.background,
        },
      });

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Store data URL for downloads
      setQrDataUrl(dataUrl);
      toast.success("QR code generated with proper DPI!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      setQrDataUrl('');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setDownloadProgress(0), 1000);
    }
  }, [qrOptions, generateQRCodeWithProperDPI]);

  const downloadPDF = async () => {
    if (!qrDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("QR Code Document", pageWidth / 2, 30, { align: "center" });

      // Add subtitle
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const currentDate = isMounted ? new Date().toLocaleDateString() : new Date().toLocaleDateString();
      pdf.text(
        `Generated on ${currentDate}`,
        pageWidth / 2,
        45,
        { align: "center" },
      );

      // Add QR code
      const qrSize = Math.min(pageWidth - 40, pageHeight - 100);
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = 60;

      // Determine image format for PDF
      let imageFormat = "PNG";
      if (qrDataUrl.startsWith("data:image/jpeg")) {
        imageFormat = "JPEG";
      } else if (qrDataUrl.startsWith("data:image/webp")) {
        // jsPDF doesn't support WebP directly, so we'll use PNG
        imageFormat = "PNG";
      }

      pdf.addImage(qrDataUrl, imageFormat, qrX, qrY, qrSize, qrSize);

      // Add encoded text below QR code
      pdf.setFontSize(10);
      pdf.text("Encoded Text:", 20, qrY + qrSize + 20);

      // Split long text into multiple lines
      const splitText = pdf.splitTextToSize(qrOptions.text, pageWidth - 40);
      pdf.text(splitText, 20, qrY + qrSize + 30);

      // Add footer
      pdf.setFontSize(8);
      pdf.text(
        "Generated by QR PDF Downloader",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );

      const timestamp = isMounted ? Date.now() : new Date().getTime();
      pdf.save(`qr-code-${timestamp}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  // Convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const downloadImage = () => {
    if (!qrDataUrl) {
      toast.error("Please generate a QR code first");
      return;
    }

    try {
      // Convert data URL to Blob
      const blob = dataURLtoBlob(qrDataUrl);

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      const timestamp = isMounted ? Date.now() : new Date().getTime();

      // Get file extension based on selected format
      const getFileExtension = (format: string) => {
        switch (format) {
          case 'jpeg':
            return 'jpg';
          case 'webp':
            return 'webp';
          default:
            return 'png';
        }
      };

      const fileExtension = getFileExtension(qrOptions.format);
      const fileName = `qr-code-${timestamp}.${fileExtension}`;

      link.download = fileName;
      link.href = blobUrl;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      // Show success message with correct format
      const formatName = qrOptions.format.toUpperCase();
      toast.success(`${formatName} image downloaded successfully!`, {
        description: `File: ${fileName}`,
        duration: 3000
      });
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }
    
    const newPreset = { name: presetName, options: { ...qrOptions } };
    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('qr-presets', JSON.stringify(updatedPresets));
    }
    
    setPresetName("");
    toast.success(`Preset "${presetName}" saved successfully!`);
  };

  const loadPreset = (preset: { name: string; options: QROptions }) => {
    setQROptions(preset.options);
    toast.success(`Preset "${preset.name}" loaded successfully!`);
  };

  const deletePreset = (index: number) => {
    const updatedPresets = savedPresets.filter((_, i) => i !== index);
    setSavedPresets(updatedPresets);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('qr-presets', JSON.stringify(updatedPresets));
    }
    
    toast.success("Preset deleted successfully!");
  };

  const presetColors = [
    { name: "Classic", fg: "#000000", bg: "#ffffff" },
    { name: "Ocean", fg: "#0EA5E9", bg: "#F0F9FF" },
    { name: "Forest", fg: "#059669", bg: "#ECFDF5" },
    { name: "Sunset", fg: "#DC2626", bg: "#FEF2F2" },
    { name: "Purple", fg: "#7C3AED", bg: "#F3E8FF" },
    { name: "Golden", fg: "#D97706", bg: "#FFFBEB" },
  ];

  const sampleTexts = [
    "https://example.com",
    "Hello, World!",
    "mailto:contact@example.com",
    "tel:+1234567890",
    "Visit our website for more information!",
  ];

  // Load presets from localStorage on component mount
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const storedPresets = localStorage.getItem('qr-presets');
      if (storedPresets) {
        setSavedPresets(JSON.parse(storedPresets));
      }
    }
  }, []);

  // Auto-generate QR data URL for downloads when text changes
  useEffect(() => {
    if (qrOptions.text.trim()) {
      const debounceTimer = setTimeout(() => {
        generateQRCode();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
    setQrDataUrl('');
  }, [qrOptions, generateQRCode]);

  if (!isMounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          {/* Theme Toggle */}
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
          
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QR PDF Generator
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning QR codes and download them as beautiful PDFs with
              advanced customization options
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                Lightning Fast
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                Ultra Beautiful
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
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
                      value={qrOptions.text}
                      onChange={(e) =>
                        setQROptions((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }))
                      }
                      className="mt-2 min-h-[100px] resize-none"
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
                          onClick={() =>
                            setQROptions((prev) => ({ ...prev, text: sample }))
                          }
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
                      value={qrOptions.logoUrl}
                      onChange={(e) =>
                        setQROptions((prev) => ({
                          ...prev,
                          logoUrl: e.target.value,
                        }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <DragDropZone 
                    onTextExtracted={(text) => 
                      setQROptions((prev) => ({ ...prev, text }))
                    }
                    className="mt-4"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger
                        value="appearance"
                        className="flex items-center gap-1"
                      >
                        <Palette className="h-3 w-3" />
                        Style
                      </TabsTrigger>
                      <TabsTrigger
                        value="technical"
                        className="flex items-center gap-1"
                      >
                        <Settings className="h-3 w-3" />
                        Technical
                      </TabsTrigger>
                      <TabsTrigger
                        value="presets"
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Presets
                      </TabsTrigger>
                      <TabsTrigger
                        value="export"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Export
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="appearance" className="space-y-4 mt-4">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Color Presets
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {presetColors.map((preset) => (
                            <Tooltip key={preset.name}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setQROptions((prev) => ({
                                      ...prev,
                                      foreground: preset.fg,
                                      background: preset.bg,
                                    }))
                                  }
                                  className="h-12 p-1"
                                >
                                  <div
                                    className="w-full h-full rounded border-2 flex items-center justify-center text-xs font-medium"
                                    style={{
                                      backgroundColor: preset.bg,
                                      color: preset.fg,
                                      borderColor: preset.fg,
                                    }}
                                  >
                                    {preset.name}
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{preset.name} theme</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="foreground"
                            className="text-sm font-medium"
                          >
                            Foreground Color
                          </Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="foreground"
                              type="color"
                              value={qrOptions.foreground}
                              onChange={(e) =>
                                setQROptions((prev) => ({
                                  ...prev,
                                  foreground: e.target.value,
                                }))
                              }
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              value={qrOptions.foreground}
                              onChange={(e) =>
                                setQROptions((prev) => ({
                                  ...prev,
                                  foreground: e.target.value,
                                }))
                              }
                              className="flex-1"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="background"
                            className="text-sm font-medium"
                          >
                            Background Color
                          </Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="background"
                              type="color"
                              value={qrOptions.background}
                              onChange={(e) =>
                                setQROptions((prev) => ({
                                  ...prev,
                                  background: e.target.value,
                                }))
                              }
                              className="w-12 h-10 p-1 border rounded"
                            />
                            <Input
                              value={qrOptions.background}
                              onChange={(e) =>
                                setQROptions((prev) => ({
                                  ...prev,
                                  background: e.target.value,
                                }))
                              }
                              className="flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-4 mt-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Size: {qrOptions.size}px
                          <span className="text-xs text-muted-foreground ml-2">
                            ({qrOptions.size <= 416 ? 'Small' :
                              qrOptions.size <= 600 ? 'Medium' :
                              qrOptions.size <= 800 ? 'Large' : 'Extra Large'})
                          </span>
                        </Label>
                        <Slider
                          value={[qrOptions.size]}
                          onValueChange={(value) =>
                            setQROptions((prev) => ({
                              ...prev,
                              size: value[0],
                            }))
                          }
                          max={1024}
                          min={128}
                          step={16}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>128px</span>
                          <span>416px</span>
                          <span>600px</span>
                          <span>800px</span>
                          <span>1024px</span>
                        </div>

                        {/* Quick Size Presets */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQROptions(prev => ({ ...prev, size: 256 }))}
                            className={qrOptions.size === 256 ? "bg-primary text-primary-foreground" : ""}
                          >
                            Small
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQROptions(prev => ({ ...prev, size: 512 }))}
                            className={qrOptions.size === 512 ? "bg-primary text-primary-foreground" : ""}
                          >
                            Medium
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQROptions(prev => ({ ...prev, size: 768 }))}
                            className={qrOptions.size === 768 ? "bg-primary text-primary-foreground" : ""}
                          >
                            Large
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQROptions(prev => ({ ...prev, size: 1024 }))}
                            className={qrOptions.size === 1024 ? "bg-primary text-primary-foreground" : ""}
                          >
                            XL
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Margin: {qrOptions.margin}
                        </Label>
                        <Slider
                          value={[qrOptions.margin]}
                          onValueChange={(value) =>
                            setQROptions((prev) => ({
                              ...prev,
                              margin: value[0],
                            }))
                          }
                          max={10}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="error-correction"
                          className="text-sm font-medium"
                        >
                          Error Correction Level
                        </Label>
                        <Select
                          value={qrOptions.errorCorrectionLevel}
                          onValueChange={(value: "L" | "M" | "Q" | "H") =>
                            setQROptions((prev) => ({
                              ...prev,
                              errorCorrectionLevel: value,
                            }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Low (7%)</SelectItem>
                            <SelectItem value="M">Medium (15%)</SelectItem>
                            <SelectItem value="Q">Quartile (25%)</SelectItem>
                            <SelectItem value="H">High (30%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Logo Size: {qrOptions.logoSize}px
                        </Label>
                        <Slider
                          value={[qrOptions.logoSize || 60]}
                          onValueChange={(value) =>
                            setQROptions((prev) => ({
                              ...prev,
                              logoSize: value[0],
                            }))
                          }
                          max={120}
                          min={20}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="logo-background"
                          checked={qrOptions.logoBackground}
                          onCheckedChange={(checked) =>
                            setQROptions((prev) => ({
                              ...prev,
                              logoBackground: checked,
                            }))
                          }
                        />
                        <Label htmlFor="logo-background" className="text-sm font-medium">
                          White Background for Logo
                        </Label>
                      </div>
                    </TabsContent>

                    <TabsContent value="presets" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="preset-name" className="text-sm font-medium">
                          Save Current Configuration
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="preset-name"
                            placeholder="Enter preset name..."
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={savePreset} size="sm">
                            <Star className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Saved Presets ({savedPresets.length})
                        </Label>
                        {savedPresets.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {savedPresets.map((preset, index) => (
                              <div
                                key={`${preset.name}-${index}`}
                                className="flex items-center justify-between p-2 border rounded-md bg-slate-50"
                              >
                                <span className="text-sm font-medium">
                                  {preset.name}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loadPreset(preset)}
                                    className="h-7 px-2"
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deletePreset(index)}
                                    className="h-7 px-2"
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No saved presets yet. Save your current configuration above.
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="export" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="format" className="text-sm font-medium">
                          Image Format
                        </Label>
                        <Select
                          value={qrOptions.format}
                          onValueChange={(value: "png" | "jpeg" | "webp") =>
                            setQROptions((prev) => ({ ...prev, format: value }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">
                              PNG (Recommended)
                            </SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="preview-mode"
                          checked={previewMode}
                          onCheckedChange={setPreviewMode}
                        />
                        <Label
                          htmlFor="preview-mode"
                          className="text-sm font-medium"
                        >
                          Live Preview Mode
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enable-pdf-password"
                          checked={qrOptions.enablePdfPassword}
                          onCheckedChange={(checked) =>
                            setQROptions((prev) => ({
                              ...prev,
                              enablePdfPassword: checked,
                            }))
                          }
                        />
                        <Label htmlFor="enable-pdf-password" className="text-sm font-medium">
                          Password Protect PDF
                        </Label>
                      </div>

                      {qrOptions.enablePdfPassword && (
                        <div>
                          <Label htmlFor="pdf-password" className="text-sm font-medium">
                            PDF Password
                          </Label>
                          <Input
                            id="pdf-password"
                            type="password"
                            placeholder="Enter password for PDF..."
                            value={qrOptions.pdfPassword}
                            onChange={(e) =>
                              setQROptions((prev) => ({
                                ...prev,
                                pdfPassword: e.target.value,
                              }))
                            }
                            className="mt-2"
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <QuickActions 
                onQuickAction={(text) => 
                  setQROptions((prev) => ({ ...prev, text }))
                }
              />
            </div>

            {/* Right Panel - Preview and Actions */}
            <div className="space-y-6">
              <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-green-600" />
                    QR Code Preview
                    {qrOptions.text.trim() && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({qrOptions.size}×{qrOptions.size}px)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Real-time preview of your QR code
                    {qrOptions.size > 600 && (
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
                      height: qrOptions.size > 600 ? '600px' : 'auto',
                      aspectRatio: qrOptions.size <= 600 ? '1' : 'auto'
                    }}
                  >
                    <div
                      className="overflow-auto w-full h-full flex items-center justify-center p-4"
                      style={{
                        minHeight: qrOptions.size <= 600 ? 'auto' : '600px'
                      }}
                    >
                      {qrOptions.text.trim() ? (
                        <div className="flex items-center justify-center" data-qr-preview>
                          <QRCodeSVG
                            value={qrOptions.text}
                            size={qrOptions.size}
                            bgColor={qrOptions.background}
                            fgColor={qrOptions.foreground}
                            level={qrOptions.errorCorrectionLevel}
                            marginSize={qrOptions.margin}
                            className="block"
                          />
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
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                            <p className="text-sm font-medium">
                              Generating QR Code...
                            </p>
                            <Progress
                              value={downloadProgress}
                              className="w-32 mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-card/80 backdrop-blur border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-purple-600" />
                    Download Options
                  </CardTitle>
                  <CardDescription>
                    Export your QR code in different formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={downloadPDF}
                      disabled={!qrDataUrl}
                      className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer relative z-10"
                      type="button"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Download as PDF
                    </Button>

                    <Button
                      onClick={downloadImage}
                      disabled={!qrDataUrl}
                      variant="outline"
                      className="h-14 border-2 cursor-pointer relative z-10"
                      type="button"
                    >
                      <Image className="h-5 w-5 mr-2" />
                      Download as {qrOptions.format.toUpperCase()}
                    </Button>










                  </div>

                  <ShareOptions qrDataUrl={qrDataUrl} qrText={qrOptions.text} />

                  {!previewMode && (
                    <Button
                      onClick={generateQRCode}
                      disabled={!qrOptions.text.trim() || isGenerating}
                      className="w-full h-12"
                      variant="secondary"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>



              <UsageStats />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
