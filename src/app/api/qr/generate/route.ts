import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// Enhanced interfaces for server-side QR generation
interface QRGenerationRequest {
  text: string;
  size?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  format?: "png" | "jpeg" | "webp" | "svg";
  color?: {
    dark?: string;
    light?: string;
  };
  quality?: number;
}

interface QRGenerationResponse {
  success: boolean;
  dataUrl?: string;
  svgString?: string;
  format: string;
  size: number;
  timestamp: number;
  error?: string;
}

// Security validation for QR input
function validateQRInput(
  text: string,
  options: QRGenerationRequest,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Text validation
  if (!text || typeof text !== "string") {
    errors.push("Text is required and must be a string");
  }

  if (text.length > 4296) {
    // QR Code maximum capacity
    errors.push("Text exceeds maximum QR code capacity (4296 characters)");
  }

  // Size validation
  if (options.size && (options.size < 64 || options.size > 2048)) {
    errors.push("Size must be between 64 and 2048 pixels");
  }

  // Margin validation
  if (options.margin && (options.margin < 0 || options.margin > 20)) {
    errors.push("Margin must be between 0 and 20");
  }

  // Color validation
  if (options.color?.dark && !/^#[0-9A-Fa-f]{6}$/.test(options.color.dark)) {
    errors.push("Dark color must be a valid hex color");
  }

  if (options.color?.light && !/^#[0-9A-Fa-f]{6}$/.test(options.color.light)) {
    errors.push("Light color must be a valid hex color");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize input to prevent XSS and injection attacks
function sanitizeInput(text: string): string {
  // Remove potentially dangerous characters while preserving QR functionality
  return text
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .trim();
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<QRGenerationResponse>> {
  try {
    const body: QRGenerationRequest = await request.json();

    // Validate input
    const validation = validateQRInput(body.text, body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          format: body.format || "png",
          size: body.size || 512,
          timestamp: Date.now(),
          error: `Validation failed: ${validation.errors.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(body.text);

    // Set default options
    const options = {
      width: body.size || 512,
      margin: body.margin || 4,
      errorCorrectionLevel: body.errorCorrectionLevel || ("M" as const),
      color: {
        dark: body.color?.dark || "#000000",
        light: body.color?.light || "#ffffff",
      },
    };

    const format = body.format || "png";
    const quality = body.quality || 0.95;

    // Generate QR code based on format
    if (format === "svg") {
      // Generate SVG QR code (browser-independent)
      const svgString = await QRCode.toString(sanitizedText, {
        type: "svg",
        ...options,
      });

      return NextResponse.json({
        success: true,
        svgString,
        format: "svg",
        size: options.width,
        timestamp: Date.now(),
      });
    }

    // Generate raster QR code (PNG/JPEG/WebP)
    const dataUrl = await QRCode.toDataURL(sanitizedText, {
      ...options,
      type:
        format === "jpeg"
          ? "image/jpeg"
          : format === "webp"
            ? "image/webp"
            : "image/png",
      rendererOpts: {
        quality: format === "jpeg" ? quality : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      dataUrl,
      format,
      size: options.width,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("QR generation error:", error);

    return NextResponse.json(
      {
        success: false,
        format: "png",
        size: 512,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "QR generation failed",
      },
      { status: 500 },
    );
  }
}

// GET method for health check
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "healthy",
    service: "QR Generation API",
    timestamp: Date.now(),
    capabilities: ["png", "jpeg", "webp", "svg"],
  });
}
