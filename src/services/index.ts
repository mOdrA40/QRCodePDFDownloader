/**
 * Services barrel export
 * Central export point for all service modules
 */

export { QRService, qrService } from "./qr-service";
export { PDFService, pdfService } from "./pdf-service";
export { FileService, fileService } from "./file-service";
export { StorageService, storageService } from "./storage-service";
export { geolocationService } from "./geolocation-service";

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

// Import services for registration
import { qrService } from "./qr-service";
import { pdfService } from "./pdf-service";
import { fileService } from "./file-service";
import { storageService } from "./storage-service";
import { geolocationService } from "./geolocation-service";

// Register default services
ServiceRegistry.register("qr", qrService);
ServiceRegistry.register("pdf", pdfService);
ServiceRegistry.register("file", fileService);
ServiceRegistry.register("storage", storageService);
ServiceRegistry.register("geolocation", geolocationService);
