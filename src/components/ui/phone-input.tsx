"use client";

import React, { forwardRef, useEffect, useState } from "react";
import PhoneInputComponent, {
  type Country,
  type Value as PhoneValue,
  getCountryCallingCode,
  parsePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { geolocationService } from "@/services/geolocation-service";
import { AlertCircle } from "lucide-react";

interface PhoneInputProps {
  value?: PhoneValue;
  onChange?: (value?: PhoneValue) => void;
  placeholder?: string;
  defaultCountry?: Country;
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
  enableIPDetection?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Enter phone number",
      defaultCountry = "ID", // Default ke Indonesia
      disabled = false,
      className,
      error,
      label,
      required = false,
      id,
      enableIPDetection = true,
      ...props
    },
    ref,
  ) => {
    const [detectedCountry, setDetectedCountry] =
      useState<Country>(defaultCountry);
    const [isDetecting, setIsDetecting] = useState(false);

    // Detect user's country based on IP
    useEffect(() => {
      if (!enableIPDetection) return;

      const detectCountry = async () => {
        setIsDetecting(true);
        try {
          const result = await geolocationService.detectUserCountry();
          setDetectedCountry(result.country);

          // Optional: Log detection result for debugging
          if (process.env.NODE_ENV === "development") {
            console.log("Country detection result:", result);
          }
        } catch (error) {
          console.warn("Failed to detect country:", error);
          setDetectedCountry(defaultCountry);
        } finally {
          setIsDetecting(false);
        }
      };

      detectCountry();
    }, [enableIPDetection, defaultCountry]);

    const currentDefaultCountry = enableIPDetection
      ? detectedCountry
      : defaultCountry;
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <PhoneInputComponent
            id={id}
            value={value}
            onChange={onChange || (() => {})}
            defaultCountry={currentDefaultCountry}
            placeholder={placeholder}
            disabled={disabled || isDetecting}
            addInternationalOption={false}
            className={cn(
              "phone-input-container",
              error && "phone-input-error",
              isDetecting && "phone-input-loading",
              className,
            )}
            numberInputProps={{
              className: cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500 focus-visible:ring-red-500",
              ),
            }}
            countrySelectProps={{
              className: cn(
                "flex h-10 items-center justify-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500",
              ),
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

// Utility functions untuk validasi dan formatting
export const validatePhoneNumber = (phoneNumber: PhoneValue): boolean => {
  if (!phoneNumber) return false;
  return isValidPhoneNumber(phoneNumber);
};

export const formatPhoneNumber = (phoneNumber: PhoneValue): string => {
  if (!phoneNumber) return "";
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed ? parsed.formatInternational() : phoneNumber;
  } catch {
    return phoneNumber;
  }
};

export const getCleanPhoneNumber = (phoneNumber: PhoneValue): string => {
  if (!phoneNumber) return "";
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed ? parsed.format("E.164") : phoneNumber;
  } catch {
    return phoneNumber.replace(/[^\d+]/g, "");
  }
};

export { PhoneInput, type PhoneValue, type Country };
