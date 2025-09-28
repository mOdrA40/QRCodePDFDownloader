/**
 * Validation Backward Compatibility Export
 */

// File validation utilities
export { validateFileUpload } from "./validation/file-validation";
// PDF-specific validation
export { validatePDFOptions } from "./validation/pdf-validation";
// QR-specific validation
export { validateQROptions } from "./validation/qr-validation";
// Validation schemas and interfaces
export type { ValidationResult } from "./validation/schemas";
export { validatePresetName } from "./validation/schemas";
