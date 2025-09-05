"use client";

import type React from "react";
import { memo } from "react";
import { Upload, FileText, Image as ImageIcon, Link } from "lucide-react";
import { useFileHandler } from "@/hooks";

interface DragDropZoneProps {
  onTextExtracted: (text: string) => void;
  className?: string;
}

export const DragDropZone = memo(function DragDropZone({ 
  onTextExtracted, 
  className 
}: DragDropZoneProps) {
  const {
    dragDropState,
    isProcessing,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileHandler(onTextExtracted, 1);

  const { isDragOver } = dragDropState;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`p-3 rounded-full ${
          isDragOver 
            ? 'bg-blue-100 dark:bg-blue-900/30' 
            : 'bg-slate-100 dark:bg-slate-800'
        }`}>
          {isProcessing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          ) : (
            <Upload className={`h-6 w-6 ${
              isDragOver ? 'text-blue-600' : 'text-slate-500'
            }`} />
          )}
        </div>
        
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {isProcessing 
              ? 'Processing file...' 
              : isDragOver 
                ? 'Drop your file here' 
                : 'Drag & drop a file'
            }
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Support text, JSON, and other files up to 10MB
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Text</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            <span>URLs</span>
          </div>
        </div>
      </div>
    </div>
  );
});
