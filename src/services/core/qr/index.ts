/**
 * QR Services Barrel Export
 * Central export point for all QR-related business logic services
 */

// QR Format Service
export { QRFormatService } from "./qr-formatting";
// QR Generation Service
export { QRService, qrService } from "./qr-generation";
// QR Data Validation Service
export { QRDataValidator, qrDataValidator } from "./qr-validation";

// Create singleton instance for QR Format Service
import { QRFormatService } from "./qr-formatting";
export const qrFormatService = QRFormatService.getInstance();
