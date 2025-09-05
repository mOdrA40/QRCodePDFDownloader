/**
 * File Handling Service
 * Manages file operations with security and validation
 */

import type {
  FileProcessingResult,
  FileValidationResult,
  FileUploadConfig,
  DownloadOptions,
  ExportResult,
  SupportedFileType,
} from "@/types";

export class FileService {
  private static instance: FileService;

  // Default configuration
  private readonly defaultConfig: FileUploadConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "text/plain",
      "application/json",
      "text/csv",
      "text/xml",
      "text/html",
    ],
    maxFiles: 1,
  };

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Validates uploaded file against security rules
   */
  public validateFile(file: File, config?: Partial<FileUploadConfig>): FileValidationResult {
    const finalConfig = { ...this.defaultConfig, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Size validation
    if (file.size > finalConfig.maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(finalConfig.maxSize)})`);
    }

    // Type validation
    if (!finalConfig.allowedTypes.includes(file.type as SupportedFileType)) {
      errors.push(`File type "${file.type}" is not supported`);
    }

    // Name validation
    if (this.containsSuspiciousPatterns(file.name)) {
      errors.push("File name contains suspicious patterns");
    }

    // Additional security checks
    if (file.name.length > 255) {
      errors.push("File name is too long");
    }

    if (file.size === 0) {
      errors.push("File is empty");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };
  }

  /**
   * Processes file and extracts text content safely
   */
  public async processFile(file: File): Promise<FileProcessingResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified),
          },
        };
      }

      const extractedText = await this.extractTextFromFile(file);

      return {
        success: true,
        extractedText: this.sanitizeExtractedText(extractedText),
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "File processing failed",
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified),
        },
      };
    }
  }

  /**
   * Extracts text content from different file types
   */
  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    switch (fileType) {
      case "text/plain":
        return await file.text();

      case "application/json": {
        const jsonText = await file.text();
        try {
          const parsed = JSON.parse(jsonText);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return jsonText;
        }
      }

      case "text/csv":
      case "text/xml":
      case "text/html":
        return await file.text();

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Downloads data as file with proper security measures
   */
  public downloadFile(data: string | Blob, options: DownloadOptions): ExportResult {
    try {
      const filename = this.sanitizeFilename(options.filename || `download-${Date.now()}`);
      let blob: Blob;

      if (typeof data === "string") {
        // Handle data URL
        if (data.startsWith("data:")) {
          blob = this.dataURLtoBlob(data);
        } else {
          // Handle plain text
          blob = new Blob([data], { type: "text/plain" });
        }
      } else {
        blob = data;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return {
        success: true,
        filename,
        size: blob.size,
        format: options.format,
        downloadUrl: url,
      };
    } catch (error) {
      return {
        success: false,
        format: options.format,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  }

  /**
   * Converts data URL to Blob
   */
  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Sanitizes filename to prevent security issues
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_\.\s]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/\.+/g, ".") // Remove multiple dots
      .slice(0, 100); // Limit length
  }

  /**
   * Sanitizes extracted text content
   */
  private sanitizeExtractedText(text: string): string {
    // Remove control characters except newlines and tabs
    const sanitized = text.split('').filter(char => {
      const code = char.charCodeAt(0);
      // Allow newline (10), tab (9), and printable characters (32-126)
      return code === 9 || code === 10 || (code >= 32 && code <= 126) || code > 127;
    }).join('');

    return sanitized.slice(0, 10000); // Limit to 10k characters
  }

  /**
   * Checks for suspicious patterns in filename
   */
  private containsSuspiciousPatterns(filename: string): boolean {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Formats file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }
}

// Export singleton instance
export const fileService = FileService.getInstance();
