/**
 * Profile Detail Item Component
 * Reusable component for displaying profile information with copy functionality
 */

"use client";

import { Check, Copy, type LucideIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/profile";

interface ProfileDetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  field: string;
  className?: string;
  isMonospace?: boolean;
}

export const ProfileDetailItem = memo(function ProfileDetailItem({
  icon: Icon,
  label,
  value,
  field,
  className = "",
  isMonospace = false,
}: ProfileDetailItemProps) {
  const { copiedField, copyText } = useCopyToClipboard();

  const handleCopy = () => {
    copyText(value, field, `${label} copied to clipboard!`);
  };

  return (
    <div
      className={`flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg w-full max-w-full overflow-hidden ${className}`}
    >
      <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-xs xs:text-sm font-medium">{label}</p>
        <div className="flex items-center gap-1 xs:gap-2">
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <p
                className={`text-xs xs:text-sm text-muted-foreground cursor-help break-all overflow-wrap-anywhere hyphens-auto max-w-full break-words ${isMonospace ? "font-mono text-xs leading-tight" : "leading-relaxed"}`}
              >
                {value}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className={`max-w-xs break-all ${isMonospace ? "font-mono" : ""}`}>{value}</p>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 xs:h-6 xs:w-6 p-0 shrink-0"
            onClick={handleCopy}
          >
            {copiedField === field ? (
              <Check className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-600" />
            ) : (
              <Copy className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
