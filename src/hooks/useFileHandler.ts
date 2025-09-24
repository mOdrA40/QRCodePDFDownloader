/**
 * File Handler Hook
 * Manages file operations including drag & drop, validation, and processing
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { fileService } from "@/services";
import type {
  DownloadOptions,
  DragDropState,
  ExportResult,
  FileProcessingResult,
  FileValidationResult,
} from "@/types";

interface UseFileHandlerReturn {
  // State
  dragDropState: DragDropState;
  isProcessing: boolean;
  lastProcessedFile: FileProcessingResult | null;
  error: string | null;

  // Drag & Drop handlers
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => Promise<void>;

  // File operations
  processFiles: (files: FileList | File[]) => Promise<FileProcessingResult[]>;
  validateFile: (file: File) => FileValidationResult;
  downloadFile: (data: string | Blob, options: DownloadOptions) => ExportResult;

  // Utilities
  resetState: () => void;
  clearError: () => void;
}

export function useFileHandler(
  onTextExtracted?: (text: string) => void,
  maxFiles = 1
): UseFileHandlerReturn {
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    isDragOver: false,
    draggedFiles: [],
    isProcessing: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedFile, setLastProcessedFile] = useState<FileProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dragCounter = useRef(0);

  /**
   * Handles drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragCounter.current === 0) {
      setDragDropState((prev) => ({ ...prev, isDragOver: true }));
    }
    dragCounter.current++;
  }, []);

  /**
   * Handles drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragDropState((prev) => ({ ...prev, isDragOver: false }));
    }
  }, []);

  /**
   * Validates a single file
   */
  const validateFile = useCallback((file: File): FileValidationResult => {
    return fileService.validateFile(file);
  }, []);

  /**
   * Processes multiple files
   */
  const processFiles = useCallback(
    async (files: FileList | File[]): Promise<FileProcessingResult[]> => {
      setIsProcessing(true);
      setError(null);

      const fileArray = Array.from(files);
      const results: FileProcessingResult[] = [];

      for (const file of fileArray) {
        try {
          const validation = validateFile(file);

          if (!validation.isValid) {
            results.push({
              file,
              success: false,
              error: validation.errors.join(", "),
              validation,
              fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: new Date(file.lastModified),
              },
            });
            continue;
          }

          // Process file based on type
          const result = await fileService.processFile(file);
          results.push({
            file,
            success: result.success,
            data: result.data,
            error: result.error,
            validation,
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: new Date(file.lastModified),
            },
          });

          // Extract text if callback provided
          if (result.success && result.data && onTextExtracted) {
            if (typeof result.data === "string") {
              onTextExtracted(result.data);
            } else if (result.data.text) {
              onTextExtracted(result.data.text);
            }
          }
        } catch (error) {
          results.push({
            file,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            validation: {
              isValid: false,
              errors: ["Processing failed"],
              warnings: [],
              fileInfo: { name: file.name, size: file.size, type: file.type },
            },
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: new Date(file.lastModified),
            },
          });
        }
      }

      setIsProcessing(false);
      return results;
    },
    [onTextExtracted, validateFile]
  );

  /**
   * Handles file drop event
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setDragDropState((prev) => ({ ...prev, isDragOver: false }));
      setError(null);

      const files = Array.from(e.dataTransfer.files);

      // Check for text content if no files
      if (files.length === 0) {
        const text = e.dataTransfer.getData("text/plain");
        if (text && onTextExtracted) {
          onTextExtracted(text);
          toast.success("Text content added!");
          return;
        }
      }

      // Validate file count
      if (files.length > maxFiles) {
        const errorMsg = `Please drop only ${maxFiles} file${maxFiles > 1 ? "s" : ""} at a time`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Process files
      setDragDropState((prev) => ({
        ...prev,
        draggedFiles: files,
        isProcessing: true,
      }));
      await processFiles(files);
      setDragDropState((prev) => ({
        ...prev,
        isProcessing: false,
        draggedFiles: [],
      }));
    },
    [maxFiles, onTextExtracted, processFiles]
  );

  /**
   * Downloads file with proper error handling
   */
  const downloadFile = useCallback(
    (data: string | Blob, options: DownloadOptions): ExportResult => {
      try {
        setError(null);
        const result = fileService.downloadFile(data, options);

        if (result.success) {
          const formatName = options.format.toUpperCase();
          toast.success(`${formatName} file downloaded successfully!`, {
            description: result.filename ? `File: ${result.filename}` : undefined,
            duration: 3000,
          });
        } else {
          setError(result.error || "Download failed");
          toast.error(result.error || "Download failed");
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Download failed";
        setError(errorMsg);
        toast.error(errorMsg);

        return {
          success: false,
          format: options.format,
          error: errorMsg,
        };
      }
    },
    []
  );

  /**
   * Resets all state to initial values
   */
  const resetState = useCallback(() => {
    setDragDropState({
      isDragOver: false,
      draggedFiles: [],
      isProcessing: false,
    });
    setIsProcessing(false);
    setLastProcessedFile(null);
    setError(null);
    dragCounter.current = 0;
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    dragDropState,
    isProcessing,
    lastProcessedFile,
    error,

    // Drag & Drop handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // File operations
    processFiles,
    validateFile,
    downloadFile,

    // Utilities
    resetState,
    clearError,
  };
}
