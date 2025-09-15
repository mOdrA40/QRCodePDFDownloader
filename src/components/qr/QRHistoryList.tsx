/**
 * QR History List Component
 * Displays paginated list of user's QR codes with search and actions
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Download, 
  Trash2, 
  Copy, 
  Calendar,
  Settings,
  QrCode,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// const ITEMS_PER_PAGE = 10; // Removed for simple query

export function QRHistoryList() {
  const [searchTerm, setSearchTerm] = useState("");

  const qrHistory = useQuery(api.qrHistory.getUserQRHistory) || [];
  const deleteQR = useMutation(api.qrHistory.deleteQRFromHistory);

  const handleDelete = async (qrId: string) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Convex ID type conversion needed
      await deleteQR({ qrId: qrId as any });
      toast.success("QR code deleted successfully");
    } catch (error) {
      toast.error("Failed to delete QR code");
      console.error("Delete error:", error);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard");
  };

  const handleDownloadQR = (_dataUrl: string, _filename: string) => {
    // Re-generate QR code for download
    // This would typically call the QR service to regenerate
    toast.info("Download feature coming soon");
  };

  if (!qrHistory) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        {Array.from({ length: 5 }, (_, i) => i).map((index) => (
          <Card key={`skeleton-${index}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* QR History List */}
      {qrHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating QR codes to see them here
            </p>
            <Button asChild>
              <a href="/">Create Your First QR Code</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {qrHistory.map((qr) => (
            <Card key={qr._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* QR Preview Placeholder */}
                  <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* QR Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">
                        {qr.textContent.length > 50 
                          ? `${qr.textContent.substring(0, 50)}...` 
                          : qr.textContent}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {qr.qrSettings.format.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </span>
                      <span>{qr.qrSettings.size}px</span>
                      <span>{qr.qrSettings.errorCorrectionLevel} Error Correction</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyText(qr.textContent)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadQR("", qr.textContent)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(qr._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button - Removed for simple query */}
        </div>
      )}
    </div>
  );
}
