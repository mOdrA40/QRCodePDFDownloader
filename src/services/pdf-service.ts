import jsPDF from "jspdf";
import type { ExportResult, PDFGenerationOptions } from "@/types";
import { type ParsedQRContent, parseQRContent } from "@/utils/qr-content-utils";
import { qrDataValidator } from "./qr-data-validator";
import { securityService } from "./security-service";

// Enhanced interfaces for better type safety and extensibility

interface PDFTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

interface PDFLayout {
  margins: { top: number; right: number; bottom: number; left: number };
  headerHeight: number;
  footerHeight: number;
  qrSize: number;
  spacing: number;
}

// PDF-compatible icon mapping to replace Unicode emojis
interface PDFIcons {
  phone: string;
  mobile: string;
  email: string;
  wifi: string;
  website: string;
  contact: string;
  calendar: string;
  location: string;
  text: string;
  sms: string;
}

export class PDFService {
  private static instance: PDFService;

  // PDF-compatible icons using simple ASCII characters
  private readonly icons: PDFIcons = {
    phone: ">>",
    mobile: ">>",
    email: ">>",
    wifi: ">>",
    website: ">>",
    contact: ">>",
    calendar: ">>",
    location: ">>",
    text: ">>",
    sms: ">>",
  };

  // Modern color themes for beautiful PDFs
  private readonly themes: Record<string, PDFTheme> = {
    modern: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#f8fafc",
      text: "#1e293b",
      muted: "#64748b",
    },
    elegant: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#ec4899",
      background: "#faf7ff",
      text: "#374151",
      muted: "#6b7280",
    },
    professional: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#0891b2",
      background: "#f0fdf4",
      text: "#065f46",
      muted: "#6b7280",
    },
  };

  // Standard layout configuration
  private readonly defaultLayout: PDFLayout = {
    margins: { top: 25, right: 20, bottom: 25, left: 20 },
    headerHeight: 40,
    footerHeight: 15,
    qrSize: 100,
    spacing: 12,
  };

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generates enhanced PDF with QR code, beautiful design, and smart content parsing
   * Implements template-based generation for different QR types with security validation
   */
  public async generatePDF(
    qrDataUrl: string,
    qrText: string,
    options: PDFGenerationOptions = {}
  ): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      // Input validation
      if (!qrDataUrl) {
        throw new Error("QR code data URL is required");
      }

      if (!qrText || qrText.trim().length === 0) {
        throw new Error("QR text content is required");
      }

      // Security validation
      const securityValidation = securityService.validateInput(qrText);
      if (!securityValidation.isValid) {
        throw new Error(`Security validation failed: ${securityValidation.errors.join(", ")}`);
      }

      // Use sanitized input if available
      const sanitizedText = securityValidation.sanitizedInput || qrText;

      // Parse QR content to determine type and extract structured data
      const contentType = this.parseQRContent(sanitizedText);
      const themeKey = options.theme ?? "modern";

      // Get theme with fallback to modern theme
      const defaultTheme: PDFTheme = {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#f8fafc",
        text: "#1e293b",
        muted: "#e2e8f0",
      };

      let theme: PDFTheme;
      if (themeKey === "modern") {
        theme = this.themes.modern ?? defaultTheme;
      } else if (themeKey === "elegant") {
        theme = this.themes.elegant ?? defaultTheme;
      } else if (themeKey === "professional") {
        theme = this.themes.professional ?? defaultTheme;
      } else {
        theme = this.themes.modern ?? defaultTheme;
      }

      // Validate PDF options
      this.validatePDFOptions(options);

      const pdf = this.createPDFDocument(options);
      await this.addEnhancedContent(pdf, qrDataUrl, contentType, theme, options);

      const filename = this.generateFilename(options.title, contentType.type);
      const blob = pdf.output("blob");

      // Security check on generated PDF size
      if (blob.size > 50 * 1024 * 1024) {
        // 50MB limit
        throw new Error("Generated PDF exceeds maximum size limit");
      }

      this.downloadPDF(pdf, filename);

      const processingTime = Date.now() - startTime;
      console.log(`PDF generated successfully in ${processingTime}ms`);

      return {
        success: true,
        filename,
        size: blob.size,
        format: "pdf",
        contentType: contentType.type,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`PDF generation failed after ${processingTime}ms:`, error);

      return {
        success: false,
        format: "pdf",
        error: error instanceof Error ? error.message : "PDF generation failed",
      };
    }
  }

  /**
   * Creates a new PDF document with enhanced configuration and metadata
   */
  private createPDFDocument(options: PDFGenerationOptions): jsPDF {
    const pdf = new jsPDF({
      orientation: options.orientation || "portrait",
      unit: "mm",
      format: options.pageSize || "a4",
      compress: true, // Enable compression for smaller file size
    });

    // Set comprehensive document properties for better metadata
    pdf.setProperties({
      title: options.title || "QR Code Document",
      author: options.author || "QR PDF Generator Pro",
      subject: options.subject || "Generated QR Code with Enhanced Design",
      keywords: options.keywords?.join(", ") || "QR Code, PDF, Generator, Professional",
      creator: "QR PDF Generator Pro v2.0",
    });

    return pdf;
  }

  /**
   * Parses QR content using consolidated utility - simplified
   */
  private parseQRContent(qrText: string): ParsedQRContent {
    return parseQRContent(qrText);
  }

  /**
   * Adds enhanced content to PDF document with beautiful design templates
   */
  private async addEnhancedContent(
    pdf: jsPDF,
    qrDataUrl: string,
    contentType: ParsedQRContent,
    theme: PDFTheme,
    _options: PDFGenerationOptions
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const layout = this.defaultLayout;

    // Add beautiful header
    this.addEnhancedHeader(pdf, contentType, theme, pageWidth, layout);

    // Add QR code with enhanced styling
    const qrY = layout.margins.top + layout.headerHeight + layout.spacing;
    await this.addStyledQRCode(pdf, qrDataUrl, theme, pageWidth, qrY, layout.qrSize);

    // Add content-specific information
    const contentY = qrY + layout.qrSize + layout.spacing * 2;
    this.addContentSpecificInfo(pdf, contentType, theme, pageWidth, contentY, layout);

    // Add enhanced footer
    this.addEnhancedFooter(pdf, theme, pageWidth, pageHeight, layout);
  }

  /**
   * Downloads the PDF file
   */
  private downloadPDF(pdf: jsPDF, filename: string): void {
    pdf.save(filename);
  }

  /**
   * Adds enhanced header with beautiful design
   */
  private addEnhancedHeader(
    pdf: jsPDF,
    contentType: ParsedQRContent,
    theme: PDFTheme,
    pageWidth: number,
    layout: PDFLayout
  ): void {
    const { margins, headerHeight } = layout;

    // Add background gradient effect (simulated with rectangles)
    pdf.setFillColor(theme.background);
    pdf.rect(0, 0, pageWidth, headerHeight + margins.top, "F");

    // Add main title
    pdf.setTextColor(theme.primary);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text("QR Code Document", pageWidth / 2, margins.top + 12, {
      align: "center",
    });

    // Add content type badge
    pdf.setTextColor(theme.accent);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${contentType.displayName}`, pageWidth / 2, margins.top + 22, {
      align: "center",
    });

    // Add date
    pdf.setTextColor(theme.muted);
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`Generated on ${currentDate}`, pageWidth / 2, margins.top + 32, {
      align: "center",
    });
  }

  /**
   * Adds styled QR code with enhanced validation and error handling
   */
  private async addStyledQRCode(
    pdf: jsPDF,
    qrDataUrl: string,
    theme: PDFTheme,
    pageWidth: number,
    y: number,
    size: number
  ): Promise<void> {
    const x = (pageWidth - size) / 2;

    try {
      // Validate and convert QR data for PDF compatibility
      const conversionResult = await qrDataValidator.convertForPDF(qrDataUrl, {
        targetFormat: "png",
        fallbackToSVG: true,
        maxSize: 10 * 1024 * 1024, // 10MB limit
      });

      if (!conversionResult.success) {
        console.warn("QR data conversion failed:", conversionResult.error);
        this.addErrorPlaceholder(pdf, x, y, size, theme);
        return;
      }

      // Add shadow effect
      pdf.setFillColor("#00000020");
      pdf.rect(x + 2, y + 2, size, size, "F");

      // Add border
      pdf.setDrawColor(theme.secondary);
      pdf.setLineWidth(0.5);
      pdf.rect(x - 2, y - 2, size + 4, size + 4, "S");

      // Add QR code with validated data
      const imageFormat = this.getImageFormat(conversionResult.dataUrl);

      try {
        pdf.addImage(conversionResult.dataUrl, imageFormat, x, y, size, size);
      } catch (imageError) {
        console.error("Failed to add image to PDF:", imageError);
        this.addErrorPlaceholder(pdf, x, y, size, theme);
      }
    } catch (error) {
      console.error("QR code processing failed:", error);
      this.addErrorPlaceholder(pdf, x, y, size, theme);
    }
  }

  /**
   * Adds error placeholder when QR code cannot be processed
   */
  private addErrorPlaceholder(
    pdf: jsPDF,
    x: number,
    y: number,
    size: number,
    theme: PDFTheme
  ): void {
    // Add border
    pdf.setDrawColor(theme.secondary);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, size, size, "S");

    // Add error background
    pdf.setFillColor("#f8f9fa");
    pdf.rect(x, y, size, size, "F");

    // Add error text
    pdf.setTextColor("#6c757d");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    const centerX = x + size / 2;
    const centerY = y + size / 2;

    pdf.text("QR Code", centerX, centerY - 10, { align: "center" });
    pdf.text("Generation Error", centerX, centerY, { align: "center" });
    pdf.text("Please regenerate", centerX, centerY + 10, { align: "center" });
  }

  /**
   * Generates enhanced filename with content type
   */
  private generateFilename(title?: string, contentType?: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
    const typePrefix = contentType ? `${contentType}-` : "";
    const baseName = title ? this.sanitizeFilename(title) : "qr-code";
    return `${typePrefix}${baseName}-${timestamp}.pdf`;
  }

  /**
   * Adds content-specific information with beautiful formatting
   */
  private addContentSpecificInfo(
    pdf: jsPDF,
    contentType: ParsedQRContent,
    theme: PDFTheme,
    pageWidth: number,
    startY: number,
    layout: PDFLayout
  ): void {
    let currentY = startY;
    const { margins } = layout;
    const contentWidth = pageWidth - margins.left - margins.right;

    // Add section title
    pdf.setTextColor(theme.primary);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Content Details", margins.left, currentY);
    currentY += 12;

    // Add content based on type
    switch (contentType.type) {
      case "email":
        this.addEmailInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "wifi":
        this.addWiFiInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "phone":
        this.addPhoneInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "sms":
        this.addSMSInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "url":
        this.addUrlInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "vcard":
        this.addVCardInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "event":
        this.addEventInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      case "location":
        this.addLocationInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
        break;
      default:
        this.addTextInfo(pdf, contentType.data, theme, margins.left, currentY, contentWidth);
    }
  }

  /**
   * Adds email-specific information with enhanced styling
   */
  private addEmailInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with email icon
    currentY = this.addSectionHeader(
      pdf,
      this.icons.email,
      "Email Composition",
      theme,
      x,
      currentY
    );

    this.addInfoField(pdf, "Email Address:", String(data.email || ""), theme, x, currentY, width);
    currentY += 8;

    if (data.subject) {
      this.addInfoField(pdf, "Subject:", String(data.subject), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.body) {
      this.addInfoField(pdf, "Message:", String(data.body), theme, x, currentY, width);
      currentY += 8;
    }

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to open email app with pre-filled content",
      theme,
      x,
      currentY + 4
    );
  }

  /**
   * Sanitizes filename to remove invalid characters
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 50);
  }

  /**
   * Adds WiFi-specific information with enhanced styling
   */
  private addWiFiInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with WiFi icon
    currentY = this.addSectionHeader(
      pdf,
      this.icons.wifi,
      "WiFi Network Configuration",
      theme,
      x,
      currentY
    );

    this.addInfoField(
      pdf,
      "Network Name (SSID):",
      String(data.ssid || ""),
      theme,
      x,
      currentY,
      width
    );
    currentY += 8;
    this.addInfoField(
      pdf,
      "Security Type:",
      String(data.security || data.type || ""),
      theme,
      x,
      currentY,
      width
    );
    currentY += 8;

    if (data.password) {
      this.addInfoField(pdf, "Password:", String(data.password), theme, x, currentY, width);
      currentY += 8;
    }

    this.addInfoField(
      pdf,
      "Hidden Network:",
      String(data.hidden || "No"),
      theme,
      x,
      currentY,
      width
    );
    currentY += 12;

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to automatically connect to the WiFi network",
      theme,
      x,
      currentY
    );
  }

  /**
   * Adds phone-specific information with enhanced styling
   */
  private addPhoneInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with phone icon
    currentY = this.addSectionHeader(pdf, this.icons.phone, "Phone Number", theme, x, currentY);

    this.addInfoField(pdf, "Phone Number:", String(data.phone || ""), theme, x, currentY, width);
    currentY += 12;

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to dial the number automatically",
      theme,
      x,
      currentY
    );
  }

  /**
   * Adds SMS-specific information with enhanced styling
   */
  private addSMSInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with SMS icon
    currentY = this.addSectionHeader(pdf, this.icons.sms, "SMS Message", theme, x, currentY);

    this.addInfoField(pdf, "Phone Number:", String(data.phone || ""), theme, x, currentY, width);
    currentY += 8;

    if (data.message) {
      this.addInfoField(pdf, "Message:", String(data.message), theme, x, currentY, width);
      currentY += 8;
    }

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to open SMS app with pre-filled content",
      theme,
      x,
      currentY + 4
    );
  }

  /**
   * Adds URL-specific information with enhanced styling
   */
  private addUrlInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with website icon
    currentY = this.addSectionHeader(pdf, this.icons.website, "Website Link", theme, x, currentY);

    this.addInfoField(pdf, "Website URL:", String(data.url || ""), theme, x, currentY, width);
    currentY += 8;

    if (data.domain) {
      this.addInfoField(pdf, "Domain:", String(data.domain), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.protocol) {
      this.addInfoField(pdf, "Protocol:", String(data.protocol), theme, x, currentY, width);
      currentY += 8;
    }

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to open the website in your browser",
      theme,
      x,
      currentY + 4
    );
  }

  /**
   * Adds vCard-specific information with enhanced styling
   */
  private addVCardInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with contact icon
    currentY = this.addSectionHeader(
      pdf,
      this.icons.contact,
      "Contact Information",
      theme,
      x,
      currentY
    );

    if (data.name) {
      this.addInfoField(pdf, "Name:", String(data.name), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.title) {
      this.addInfoField(pdf, "Title:", String(data.title), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.organization) {
      this.addInfoField(pdf, "Organization:", String(data.organization), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.phone) {
      this.addInfoField(pdf, "Phone:", String(data.phone), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.email) {
      this.addInfoField(pdf, "Email:", String(data.email), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.website) {
      this.addInfoField(pdf, "Website:", String(data.website), theme, x, currentY, width);
      currentY += 8;
    }

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to add contact to your phonebook",
      theme,
      x,
      currentY + 4
    );
  }

  /**
   * Sanitizes text content for PDF
   */
  private sanitizeText(text: string): string {
    // Remove potentially harmful characters and limit length
    const sanitized = text
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        // Allow newline (10), tab (9), and printable characters (32-126)
        return code === 9 || code === 10 || (code >= 32 && code <= 126) || code > 127;
      })
      .join("");

    return sanitized.slice(0, 2000); // Limit to 2000 characters
  }

  /**
   * Adds event-specific information with enhanced styling
   */
  private addEventInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with calendar icon
    currentY = this.addSectionHeader(
      pdf,
      this.icons.calendar,
      "Calendar Event",
      theme,
      x,
      currentY
    );

    if (data.title) {
      this.addInfoField(pdf, "Event Title:", String(data.title), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.startDate) {
      this.addInfoField(pdf, "Date & Time:", String(data.startDate), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.location) {
      this.addInfoField(pdf, "Location:", String(data.location), theme, x, currentY, width);
      currentY += 8;
    }

    if (data.description) {
      this.addInfoField(pdf, "Description:", String(data.description), theme, x, currentY, width);
      currentY += 8;
    }

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to add event to your calendar",
      theme,
      x,
      currentY + 4
    );
  }

  /**
   * Adds location-specific information with enhanced styling
   */
  private addLocationInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with location icon
    currentY = this.addSectionHeader(pdf, this.icons.location, "Location", theme, x, currentY);

    this.addInfoField(pdf, "Address:", String(data.address || ""), theme, x, currentY, width);
    currentY += 12;

    // Add instructions with mobile icon
    this.addInstructionText(
      pdf,
      "Scan this QR code to open location in maps app",
      theme,
      x,
      currentY
    );
  }

  /**
   * Adds text-specific information with enhanced styling
   */
  private addTextInfo(
    pdf: jsPDF,
    data: Record<string, unknown>,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    let currentY = y;

    // Add section header with text icon
    currentY = this.addSectionHeader(pdf, this.icons.text, "Text Content", theme, x, currentY);

    this.addInfoField(pdf, "Content:", String(data.content || ""), theme, x, currentY, width);
    currentY += 12;

    // Add instructions with mobile icon
    this.addInstructionText(pdf, "Scan this QR code to view the text content", theme, x, currentY);
  }

  /**
   * Helper method to add section header with icon
   */
  private addSectionHeader(
    pdf: jsPDF,
    icon: string,
    title: string,
    theme: PDFTheme,
    x: number,
    y: number
  ): number {
    // Add icon with special styling
    pdf.setTextColor(theme.accent);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(icon, x, y);

    // Add title next to icon
    pdf.setFontSize(12);
    pdf.text(title, x + 20, y);

    return y + 12; // Return next Y position
  }

  /**
   * Helper method to add instruction text with mobile icon
   */
  private addInstructionText(
    pdf: jsPDF,
    instruction: string,
    theme: PDFTheme,
    x: number,
    y: number
  ): void {
    pdf.setTextColor(theme.muted);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");

    // Add mobile icon and instruction
    const fullText = `${this.icons.mobile} ${instruction}`;
    pdf.text(fullText, x, y);
  }

  /**
   * Helper method to add formatted info field
   */
  private addInfoField(
    pdf: jsPDF,
    label: string,
    value: string,
    theme: PDFTheme,
    x: number,
    y: number,
    width: number
  ): void {
    // Add label
    pdf.setTextColor(theme.secondary);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(label, x, y);

    // Add value
    pdf.setTextColor(theme.text);
    pdf.setFont("helvetica", "normal");
    const sanitizedValue = this.sanitizeText(value);
    const splitValue = pdf.splitTextToSize(sanitizedValue, width - 40);
    pdf.text(splitValue, x + 40, y);
  }

  /**
   * Adds enhanced footer with branding and metadata
   */
  private addEnhancedFooter(
    pdf: jsPDF,
    theme: PDFTheme,
    pageWidth: number,
    pageHeight: number,
    layout: PDFLayout
  ): void {
    const footerY = pageHeight - layout.margins.bottom;

    // Add separator line
    pdf.setDrawColor(theme.secondary);
    pdf.setLineWidth(0.3);
    pdf.line(layout.margins.left, footerY - 8, pageWidth - layout.margins.right, footerY - 8);

    // Add footer text
    pdf.setTextColor(theme.muted);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Generated by QR PDF Generator Pro - Professional QR Code Solutions",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );
  }

  /**
   * Validates PDF generation options
   */
  private validatePDFOptions(options: PDFGenerationOptions): void {
    // Validate theme
    if (options.theme && !Object.keys(this.themes).includes(options.theme)) {
      throw new Error(
        `Invalid theme: ${options.theme}. Available themes: ${Object.keys(this.themes).join(", ")}`
      );
    }

    // Validate page size
    const validPageSizes = ["a4", "letter", "legal"];
    if (options.pageSize && !validPageSizes.includes(options.pageSize)) {
      throw new Error(
        `Invalid page size: ${options.pageSize}. Valid sizes: ${validPageSizes.join(", ")}`
      );
    }

    // Validate orientation
    const validOrientations = ["portrait", "landscape"];
    if (options.orientation && !validOrientations.includes(options.orientation)) {
      throw new Error(
        `Invalid orientation: ${options.orientation}. Valid orientations: ${validOrientations.join(", ")}`
      );
    }
  }

  /**
   * Determines image format from data URL
   */
  private getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
    if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
    if (dataUrl.startsWith("data:image/webp")) return "PNG"; // jsPDF doesn't support WebP
    return "PNG";
  }

  /**
   * Validates PDF generation options
   */
  public validateOptions(options: PDFGenerationOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (options.title && options.title.length > 100) {
      errors.push("Title must be less than 100 characters");
    }

    if (options.author && options.author.length > 100) {
      errors.push("Author must be less than 100 characters");
    }

    if (options.password && options.password.length < 4) {
      errors.push("Password must be at least 4 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const pdfService = PDFService.getInstance();
