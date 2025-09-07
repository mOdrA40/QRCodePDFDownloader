/**
 * Browser Compatibility Modal Component
 * Shows browser detection results and optimization recommendations in a modal
 * Triggered when downloading PDF on problematic browsers
 */

"use client";

import {
  AlertTriangle,
  CheckCircle,
  Download,
  Monitor,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BrowserCapabilities } from "@/services/browser-detection-service";
import {
  BrowserType,
  browserDetectionService,
  PrivacyLevel,
} from "@/services/browser-detection-service";

interface BrowserCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  title?: string;
  description?: string;
}

export function BrowserCompatibilityModal({
  isOpen,
  onClose,
  onContinue,
  title = "Browser Compatibility Check",
  description = "We've detected potential compatibility issues with your browser.",
}: BrowserCompatibilityModalProps) {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(
    null,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const caps = browserDetectionService.detectCapabilities();
      setCapabilities(caps);
    }
  }, []);

  if (!isClient || !capabilities) {
    return null;
  }

  const getBrowserIcon = (type: BrowserType) => {
    switch (type) {
      case BrowserType.LIBREWOLF:
        return <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case BrowserType.FIREFOX:
        return (
          <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        );
      case BrowserType.CHROME:
        return (
          <Monitor className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case BrowserType.SAFARI:
        return <Monitor className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case BrowserType.BRAVE:
        return (
          <Shield className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        );
      case BrowserType.TOR:
        return (
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        );
      default:
        return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getPrivacyBadgeColor = (level: PrivacyLevel) => {
    switch (level) {
      case PrivacyLevel.HIGH:
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case PrivacyLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
      case PrivacyLevel.LOW:
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getCompatibilityStatus = () => {
    if (capabilities.type === BrowserType.LIBREWOLF) {
      return {
        icon: (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        ),
        text: "LibreWolf Optimized",
        description:
          "This application is fully optimized for LibreWolf browser",
        severity: "success" as const,
      };
    }

    if (capabilities.isPrivacyBrowser) {
      return {
        icon: <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        text: "Privacy Browser Detected",
        description:
          "Enhanced compatibility mode will be used for optimal performance",
        severity: "info" as const,
      };
    }

    if (!capabilities.supportsCanvas) {
      return {
        icon: (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        ),
        text: "Limited Canvas Support",
        description:
          "Canvas operations are blocked. SVG fallback will be used.",
        severity: "warning" as const,
      };
    }

    return {
      icon: (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      ),
      text: "Fully Compatible",
      description: "All features are available and working optimally",
      severity: "success" as const,
    };
  };

  const status = getCompatibilityStatus();
  const recommendations =
    browserDetectionService.getOptimizationRecommendations();

  // Get alert styling based on severity with proper dark mode support
  const getAlertStyling = (severity: "success" | "warning" | "info") => {
    switch (severity) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30";
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getBrowserIcon(capabilities.type)}
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="text-sm">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Browser Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">
                  {capabilities.type}
                </span>
                <Badge
                  className={getPrivacyBadgeColor(capabilities.privacyLevel)}
                >
                  {capabilities.privacyLevel} privacy
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Version {capabilities.version} • Method:{" "}
                {capabilities.recommendedMethod.replace("-", " ")}
              </p>
            </div>
          </div>

          {/* Status Alert */}
          <Alert className={getAlertStyling(status.severity)}>
            {status.icon}
            <AlertDescription>
              <div>
                <p className="font-medium text-foreground">{status.text}</p>
                <p className="text-sm text-muted-foreground">
                  {status.description}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* LibreWolf Specific Message */}
          {capabilities.type === BrowserType.LIBREWOLF && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    LibreWolf Detected
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    PDF generation will use server-side processing for optimal
                    compatibility and quality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Optimizations Applied:
              </h4>
              <ul className="space-y-1">
                {recommendations.slice(0, 3).map((rec) => (
                  <li
                    key={rec}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Capabilities Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {capabilities.supportsCanvas ? (
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <X className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span>Canvas</span>
            </div>
            <div className="flex items-center gap-1">
              {capabilities.features.localStorageEnabled ? (
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <X className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span>Storage</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show for browsers that can actually generate good PDFs */}
        {capabilities.supportsCanvas && !capabilities.isPrivacyBrowser && (
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onContinue} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Continue Download
            </Button>
          </div>
        )}

        {(!capabilities.supportsCanvas || capabilities.isPrivacyBrowser) && (
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {capabilities.type === BrowserType.LIBREWOLF
                ? "LibreWolf's privacy settings prevent optimal PDF generation. Please use image download instead."
                : "Your browser's privacy settings may prevent optimal PDF generation. Please try image download instead."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
