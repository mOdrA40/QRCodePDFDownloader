/**
 * Services barrel export
 * Central export point for all service modules
 */

export {
  BrowserDetectionService,
  browserDetectionService,
} from "./browser-detection-service";
export { FileService, fileService } from "./file-service";
export { geolocationService } from "./geolocation-service";
export { PDFService, pdfService } from "./pdf-service";
export { QRDataValidator, qrDataValidator } from "./qr-data-validator";
export { QRService, qrService } from "./qr-service";
export { StorageService, storageService } from "./storage-service";
export { SVGQRService, svgQRService } from "./svg-qr-service";

// Service registry for dependency injection (if needed in the future)
const services = new Map<string, unknown>();

export const ServiceRegistry = {
  register<T>(key: string, service: T): void {
    services.set(key, service);
  },

  get<T>(key: string): T {
    return services.get(key) as T;
  },

  has(key: string): boolean {
    return services.has(key);
  },
};

import { browserDetectionService } from "./browser-detection-service";
import { fileService } from "./file-service";
import { geolocationService } from "./geolocation-service";
import { pdfService } from "./pdf-service";
import { qrDataValidator } from "./qr-data-validator";
// Import services for registration
import { qrService } from "./qr-service";
import { storageService } from "./storage-service";
import { svgQRService } from "./svg-qr-service";

// Register default services
ServiceRegistry.register("qr", qrService);
ServiceRegistry.register("pdf", pdfService);
ServiceRegistry.register("file", fileService);
ServiceRegistry.register("storage", storageService);
ServiceRegistry.register("geolocation", geolocationService);
ServiceRegistry.register("svgQR", svgQRService);
ServiceRegistry.register("browserDetection", browserDetectionService);
ServiceRegistry.register("qrDataValidator", qrDataValidator);
