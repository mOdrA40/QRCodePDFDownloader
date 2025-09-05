/**
 * File Handler Hook
 * Manages file operations including drag & drop, validation, and processing
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { fileService } from "@/services";
import type {
  FileProcessingResult,
  FileValidationResult,
  DragDropState,
  ExportResult,
  DownloadOptions,
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
      setDragDropState(prev => ({ ...prev, isDragOver: true }));
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
      setDragDropState(prev => ({ ...prev, isDragOver: false }));
    }
  }, []);

  /**
   * Handles file drop event
   */
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = 0;
    setDragDropState(prev => ({ ...prev, isDragOver: false }));
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
    setDragDropState(prev => ({ ...prev, draggedFiles: files, isProcessing: true }));
    await processFiles(files);
    setDragDropState(prev => ({ ...prev, isProcessing: false, draggedFiles: [] }));
  }, [maxFiles, onTextExtracted]);

  /**
   * Validates a single file
   */
  const validateFile = useCallback((file: File): FileValidationResult => {
    return fileService.validateFile(file);
  }, []);

  /**
   * Processes multiple files
   */
  const processFiles = useCallback(async (files: FileList | File[]): Promise<FileProcessingResult[]> => {
    setIsProcessing(true);
    setError(null);
    
    const fileArray = Array.from(files);
    const results: FileProcessingResult[] = [];

    try {
      for (const file of fileArray) {
        // Validate file first
        const validation = validateFile(file);
        if (!validation.isValid) {
          const errorMsg = `File "${file.name}": ${validation.errors.join(", ")}`;
          setError(errorMsg);
          toast.error(errorMsg);
          continue;
        }

        // Process file
        const result = await fileService.processFile(file);
        results.push(result);
        setLastProcessedFile(result);

        if (result.success && result.extractedText && onTextExtracted) {
          onTextExtracted(result.extractedText);
          toast.success(`Text extracted from ${file.name}`);
        } else if (!result.success) {
          const errorMsg = result.error || "Failed to process file";
          setError(errorMsg);
          toast.error(`Failed to process ${file.name}: ${errorMsg}`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "File processing failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }

    return results;
  }, [validateFile, onTextExtracted]);

  /**
   * Downloads file with proper error handling
   */
  const downloadFile = useCallback((data: string | Blob, options: DownloadOptions): ExportResult => {
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
  }, []);

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
