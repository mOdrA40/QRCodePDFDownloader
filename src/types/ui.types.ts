/**
 * UI and component related type definitions
 */

// Theme types
export type Theme = "light" | "dark" | "system";

// Modal types for quick actions
export type ModalType =
  | "wifi"
  | "phone"
  | "email"
  | "location"
  | "event"
  | "website"
  | "vcard"
  | null;

// Component state types
export type ComponentState = "idle" | "loading" | "success" | "error";

// Toast notification types
export interface ToastNotification {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

// Form validation state
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

// Quick action configuration
export interface QuickActionConfig {
  label: string;
  icon: React.ComponentType;
  modalType: ModalType;
  bgColor: string;
  description: string;
}

// Share options
export interface ShareOption {
  platform:
    | "email"
    | "whatsapp"
    | "twitter"
    | "facebook"
    | "linkedin"
    | "copy"
    | "native";
  label: string;
  icon: React.ComponentType;
  action: (data: ShareData) => void | Promise<void>;
}

// Share data
export interface ShareData {
  text: string;
  url?: string;
  title?: string;
  qrDataUrl?: string;
}

// Drag and drop state
export interface DragDropState {
  isDragOver: boolean;
  draggedFiles: File[];
  isProcessing: boolean;
}

// Progress state
export interface ProgressState {
  current: number;
  total: number;
  stage: string;
  message?: string;
}

// Settings panel state
export interface SettingsPanelState {
  activeTab: "appearance" | "technical" | "presets" | "export";
  isExpanded: boolean;
}

// Preview state
export interface PreviewState {
  isVisible: boolean;
  isFullscreen: boolean;
  zoom: number;
  position: { x: number; y: number };
}
