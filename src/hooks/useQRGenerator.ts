/**
 * QR Generator Hook
 * Manages QR code generation state and operations
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { qrService } from "@/services";
import type {
  QROptions,
  QRGenerationResult,
  QRValidationResult,
  ComponentState,
} from "@/types";

interface UseQRGeneratorReturn {
  // State
  qrOptions: QROptions;
  qrDataUrl: string;
  isGenerating: boolean;
  generationProgress: number;
  validationResult: QRValidationResult | null;
  state: ComponentState;

  // Actions
  setQROptions: (options: QROptions | ((prev: QROptions) => QROptions)) => void;
  generateQRCode: () => Promise<void>;
  validateInput: (text: string) => QRValidationResult;
  resetGenerator: () => void;
  updateOption: <K extends keyof QROptions>(key: K, value: QROptions[K]) => void;
}

const defaultQROptions: QROptions = {
  text: "",
  size: 512,
  margin: 4,
  errorCorrectionLevel: "M",
  foreground: "#000000",
  background: "#ffffff",
  format: "png",
  logoUrl: "",
  logoSize: 60,
  logoBackground: false,
  pdfPassword: "",
  enablePdfPassword: false,
};

export function useQRGenerator(initialOptions?: Partial<QROptions>): UseQRGeneratorReturn {
  const [qrOptions, setQROptions] = useState<QROptions>({
    ...defaultQROptions,
    ...initialOptions,
  });
  
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<QRValidationResult | null>(null);
  const [state, setState] = useState<ComponentState>("idle");

  /**
   * Validates QR input
   */
  const validateInput = useCallback((text: string): QRValidationResult => {
    const result = qrService.validateQRInput(text, qrOptions);
    setValidationResult(result);
    return result;
  }, [qrOptions]);

  /**
   * Generates QR code with progress tracking
   */
  const generateQRCode = useCallback(async (): Promise<void> => {
    if (!qrOptions.text.trim()) {
      toast.error("Please enter text to generate QR code");
      return;
    }

    // Validate input first
    const validation = validateInput(qrOptions.text);
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    setState("loading");
    setGenerationProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Generate QR code
      const result: QRGenerationResult = await qrService.generateQRCode(qrOptions.text, {
        size: qrOptions.size,
        margin: qrOptions.margin,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        format: qrOptions.format,
        color: {
          dark: qrOptions.foreground,
          light: qrOptions.background,
        },
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Store result
      setQrDataUrl(result.dataUrl);
      setState("success");
      toast.success("QR code generated successfully!");

    } catch (error) {
      setState("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to generate QR code";
      toast.error(errorMessage);
      setQrDataUrl("");
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setGenerationProgress(0);
        if (state !== "error") {
          setState("idle");
        }
      }, 1000);
    }
  }, [qrOptions, validateInput, state]);

  /**
   * Updates a specific QR option
   */
  const updateOption = useCallback(<K extends keyof QROptions>(
    key: K,
    value: QROptions[K]
  ): void => {
    setQROptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Resets the generator to initial state
   */
  const resetGenerator = useCallback((): void => {
    setQROptions(defaultQROptions);
    setQrDataUrl("");
    setIsGenerating(false);
    setGenerationProgress(0);
    setValidationResult(null);
    setState("idle");
  }, []);

  // Auto-generate QR code when text changes (with debounce)
  useEffect(() => {
    if (qrOptions.text.trim()) {
      const debounceTimer = setTimeout(() => {
        generateQRCode();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
    setQrDataUrl("");
    setState("idle");
  }, [qrOptions.text, generateQRCode]);

  // Validate input when options change
  useEffect(() => {
    if (qrOptions.text.trim()) {
      validateInput(qrOptions.text);
    }
  }, [qrOptions, validateInput]);

  return {
    // State
    qrOptions,
    qrDataUrl,
    isGenerating,
    generationProgress,
    validationResult,
    state,

    // Actions
    setQROptions,
    generateQRCode,
    validateInput,
    resetGenerator,
    updateOption,
  };
}
