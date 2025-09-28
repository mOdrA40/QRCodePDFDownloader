/**
 * Infrastructure Services Barrel Export
 * Central export point for all infrastructure services
 */

// Data Storage Service
export { StorageService, storageService } from "./data-storage";
// File Operations Service
export { FileService, fileService } from "./file-operations";

// Security Service
export { SecurityService } from "./security";

// Create singleton instance for Security Service
import { SecurityService } from "./security";
export const securityService = SecurityService.getInstance();
