/**
 * Consolidated QR Content Utilities
 */

// QR Content Type definition
export type QRContentType =
  | "email"
  | "wifi"
  | "phone"
  | "url"
  | "vcard"
  | "event"
  | "location"
  | "sms"
  | "text";

// Consolidated format info for all QR content types
export const QR_FORMAT_INFO = {
  png: { label: "PNG", description: "Recommended for quality", badge: "Recommended" },
  jpeg: { label: "JPEG", description: "Smaller file size", badge: null },
  webp: { label: "WebP", description: "Modern format", badge: null },
} as const;

// Consolidated content type detection
export function detectQRContentType(text: string): QRContentType {
  if (!text || typeof text !== "string") {
    return "text";
  }

  const trimmedText = text.trim();

  // WiFi QR Code
  if (trimmedText.startsWith("WIFI:")) return "wifi";

  // vCard (Contact)
  if (trimmedText.startsWith("BEGIN:VCARD") || trimmedText.includes("VCARD")) return "vcard";

  // Event (Calendar)
  if (trimmedText.startsWith("BEGIN:VEVENT") || trimmedText.includes("VEVENT")) return "event";

  // SMS
  if (trimmedText.startsWith("sms:") || trimmedText.startsWith("SMS:")) return "sms";

  // Email
  if (trimmedText.startsWith("mailto:") || isEmail(trimmedText)) return "email";

  // Phone
  if (trimmedText.startsWith("tel:") || isPhoneNumber(trimmedText)) return "phone";

  // URL
  if (isUrl(trimmedText)) return "url";

  // Location
  if (isLocation(trimmedText)) return "location";

  return "text";
}

// Simplified validation functions
function isEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function isPhoneNumber(text: string): boolean {
  return /^[+]?[1-9][\d]{0,15}$/.test(text.replace(/[\s\-()]/g, ""));
}

function isUrl(text: string): boolean {
  return /^https?:\/\/.+/.test(text);
}

function isLocation(text: string): boolean {
  return /^geo:/.test(text) || /^-?\d+\.?\d*,-?\d+\.?\d*/.test(text);
}

// Content type icons mapping
export function getContentTypeIcon(type: QRContentType): string {
  const icons: Record<QRContentType, string> = {
    text: "FileText",
    url: "Globe",
    email: "Mail",
    phone: "Phone",
    wifi: "Wifi",
    vcard: "User",
    sms: "MessageSquare",
    location: "MapPin",
    event: "Calendar",
  };

  return icons[type] || "FileText";
}

// Content type display names
export function getContentTypeDisplayName(type: QRContentType): string {
  const names: Record<QRContentType, string> = {
    text: "Text",
    url: "Website URL",
    email: "Email Address",
    phone: "Phone Number",
    wifi: "WiFi Network",
    vcard: "Contact Card",
    sms: "SMS Message",
    location: "Location",
    event: "Calendar Event",
  };

  return names[type] || "Text";
}

// Parse QR content to structured data
export interface ParsedQRContent {
  type: QRContentType;
  data: Record<string, unknown>;
  displayName: string;
}

export function parseQRContent(qrText: string): ParsedQRContent {
  const type = detectQRContentType(qrText);
  const displayName = getContentTypeDisplayName(type);

  let data: Record<string, unknown> = { text: qrText };

  switch (type) {
    case "email":
      data = parseEmailContent(qrText);
      break;
    case "wifi":
      data = parseWiFiContent(qrText);
      break;
    case "phone":
      data = parsePhoneContent(qrText);
      break;
    case "url":
      data = parseUrlContent(qrText);
      break;
    case "vcard":
      data = parseVCardContent(qrText);
      break;
    case "sms":
      data = parseSMSContent(qrText);
      break;
    case "location":
      data = parseLocationContent(qrText);
      break;
    default:
      data = { text: qrText };
  }

  return { type, data, displayName };
}

// Simplified parsers
function parseEmailContent(text: string): Record<string, unknown> {
  if (text.startsWith("mailto:")) {
    const url = new URL(text);
    return {
      email: url.pathname,
      subject: url.searchParams.get("subject") || "",
      body: url.searchParams.get("body") || "",
    };
  }
  return { email: text };
}

function parseWiFiContent(text: string): Record<string, unknown> {
  const match = text.match(/WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*);?/);
  if (match) {
    return {
      type: match[1] || "WPA",
      ssid: match[2] || "",
      password: match[3] || "",
      hidden: match[4] === "true",
    };
  }
  return { text };
}

function parsePhoneContent(text: string): Record<string, unknown> {
  const phone = text.startsWith("tel:") ? text.substring(4) : text;
  return { phone: phone.replace(/[\s\-()]/g, "") };
}

function parseUrlContent(text: string): Record<string, unknown> {
  try {
    const url = new URL(text);
    return {
      url: text,
      domain: url.hostname,
      protocol: url.protocol,
    };
  } catch {
    return { url: text };
  }
}

function parseVCardContent(text: string): Record<string, unknown> {
  const lines = text.split("\n");
  const data: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(":");
    if (key && value) {
      data[key.toLowerCase()] = value;
    }
  }

  return data;
}

function parseSMSContent(text: string): Record<string, unknown> {
  if (text.startsWith("sms:")) {
    const parts = text.substring(4).split("?");
    return {
      phone: parts[0] || "",
      message: parts[1]?.replace("body=", "") || "",
    };
  }
  return { text };
}

function parseLocationContent(text: string): Record<string, unknown> {
  if (text.startsWith("geo:")) {
    const coords = text.substring(4).split(",");
    return {
      latitude: Number.parseFloat(coords[0] || "0") || 0,
      longitude: Number.parseFloat(coords[1] || "0") || 0,
    };
  }

  const coords = text.split(",");
  if (coords.length === 2) {
    return {
      latitude: Number.parseFloat(coords[0] || "0") || 0,
      longitude: Number.parseFloat(coords[1] || "0") || 0,
    };
  }

  return { text };
}
