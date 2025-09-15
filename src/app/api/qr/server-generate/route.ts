/**
 * Server-Side QR Generation API
 * Simple, reliable QR generation for privacy browsers
 * NO AUTHENTICATION REQUIRED - QR generation is not sensitive
 */

import { type NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

interface QRGenerationRequest {
  text: string;
  options?: {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    foreground?: string;
    background?: string;
    format?: "png" | "jpeg" | "webp";
  };
}

interface QRGenerationResponse {
  success: boolean;
  dataUrl?: string;
  format?: string;
  size?: number;
  timestamp?: number;
  method?: string;
  error?: string;
}

interface QRErrorResponse {
  success: false;
  error: string;
}

// Simple input validation
function validateInput(text: string): { isValid: boolean; error?: string } {
  if (!text || typeof text !== "string") {
    return { isValid: false, error: "Text is required" };
  }

  if (text.length === 0) {
    return { isValid: false, error: "Text cannot be empty" };
  }

  if (text.length > 2048) {
    return { isValid: false, error: "Text too long (max 2048 characters)" };
  }

  return { isValid: true };
}

// Simple rate limiting (in-memory, basic)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<QRGenerationResponse | QRErrorResponse>> {
  try {
    // Basic rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Parse request body
    let body: QRGenerationRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateInput(body.text);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Validation failed",
        } as QRErrorResponse,
        { status: 400 }
      );
    }

    // Set default options with security limits
    const options = body.options || {};
    const qrOptions = {
      width: Math.min(options.size || 512, 2048), // Max 2048px for security
      margin: Math.min(options.margin || 4, 10), // Max margin 10
      color: {
        dark: options.foreground || "#000000",
        light: options.background || "#ffffff",
      },
      errorCorrectionLevel: options.errorCorrectionLevel || ("M" as const),
    };

    // Generate QR code with enhanced options for privacy browsers
    const enhancedOptions = {
      ...qrOptions,
      type: "image/png" as const,
      quality: 0.92,
      rendererOpts: {
        quality: 0.92,
      },
    };

    const dataUrl = await QRCode.toDataURL(body.text, enhancedOptions);

    // Log for monitoring (without sensitive data)
    console.log(`Server QR generated: ${qrOptions.width}px, ${body.text.length} chars`);

    const response = NextResponse.json({
      success: true,
      dataUrl,
      format: options.format || "png",
      size: qrOptions.width,
      timestamp: Date.now(),
      method: "server-side-api",
    });

    // Add headers for privacy browser compatibility
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");

    return response;

  } catch (error) {
    console.error("Server QR generation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during QR generation",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
