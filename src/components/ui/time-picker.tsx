"use client";

import { TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { type Dayjs } from "dayjs";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Material-UI theme configuration requires extensive options
const createCustomTheme = (isDark: boolean) =>
  createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: isDark ? "#ffffff" : "#000000",
      },
      background: {
        default: isDark ? "#0a0a0a" : "#ffffff",
        paper: isDark ? "#0a0a0a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#fafafa" : "#0a0a0a",
        secondary: isDark ? "#a1a1aa" : "#71717a",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              height: "40px",
              fontSize: "14px",
              borderRadius: "6px",
              backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
              "& fieldset": {
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: isDark ? "#3f3f46" : "#d4d4d8",
              },
              "&.Mui-focused fieldset": {
                borderColor: isDark ? "#ffffff" : "#000000",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                "& fieldset": {
                  borderColor: isDark ? "#27272a" : "#e4e4e7",
                },
              },
            },
            "& .MuiInputLabel-root": {
              color: isDark ? "#a1a1aa" : "#71717a",
              fontSize: "14px",
              "&.Mui-focused": {
                color: isDark ? "#ffffff" : "#000000",
              },
            },
            "& .MuiInputBase-input": {
              color: isDark ? "#fafafa" : "#0a0a0a",
              padding: "8px 12px",
              "&::placeholder": {
                color: isDark ? "#71717a" : "#a1a1aa",
                opacity: 1,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
            borderRadius: "8px",
            boxShadow: isDark
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: "9999 !important",
          },
        },
      },
      MuiPopper: {
        styleOverrides: {
          root: {
            zIndex: "9999 !important",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "6px",
            pointerEvents: "auto",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
            "&:hover": {
              backgroundColor: isDark ? "#18181b" : "#f4f4f5",
            },
            "&.MuiPickersActionBar-root &": {
              pointerEvents: "auto !important",
              zIndex: 10001,
              isolation: "isolate",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDark ? "#a1a1aa" : "#71717a",
            "&:hover": {
              backgroundColor: isDark ? "#18181b" : "#f4f4f5",
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: isDark ? "#fafafa" : "#0a0a0a",
            borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
              color: isDark ? "#fafafa" : "#0a0a0a",
            },
            "&.Mui-selected": {
              backgroundColor: isDark ? "#ffffff" : "#000000",
              color: isDark ? "#000000" : "#ffffff",
              borderColor: isDark ? "#ffffff" : "#000000",
              "&:hover": {
                backgroundColor: isDark ? "#ffffff" : "#000000",
                color: isDark ? "#000000" : "#ffffff",
              },
            },
          },
        },
      },
    },
  });

export function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  id,
}: TimePickerProps) {
  const [isDark, setIsDark] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Detect theme from document
  React.useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Enhanced event handling for better interactions
  React.useEffect(() => {
    if (isOpen) {
      const _handleStopPropagation = (e: Event) => {
        // Allow interactions within the TimePicker popper
        const target = e.target as Element;

        // IMPORTANT: Do NOT stop propagation for ANY TimePicker interactions
        // Let all time picker interactions work normally
        if (
          target.closest(".MuiPickersPopper-root") ||
          target.closest(".MuiTimePicker-root") ||
          target.closest(".MuiMultiSectionDigitalClockSection-root") ||
          target.closest(".MuiClock-root") ||
          target.closest(".MuiToggleButtonGroup-root") ||
          target.closest(".MuiPickersActionBar-root") ||
          target.closest("button") ||
          target.closest(".MuiButton-root")
        ) {
          return; // Let ALL TimePicker events propagate normally
        }
      };

      // Enhanced wheel scrolling for time sections - less aggressive
      const handleWheelScroll = (e: WheelEvent) => {
        const target = e.target as Element;
        const timeSection = target.closest(".MuiMultiSectionDigitalClockSection-root");

        // Only handle wheel events specifically within time sections
        if (timeSection?.contains(target)) {
          // Don't prevent default or stop propagation - let normal scrolling work
          // Only add smooth scrolling enhancement
          const scrollAmount =
            Math.abs(e.deltaY) > 100
              ? e.deltaY > 0
                ? 80
                : -80
              : // Fast scroll
                e.deltaY > 0
                ? 40
                : -40; // Normal scroll

          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            timeSection.scrollBy({
              top: scrollAmount,
              behavior: "smooth",
            });
          });
        }
      };

      // Enhanced keyboard navigation for time sections - less aggressive
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as Element;
        const timeSection = target.closest(".MuiMultiSectionDigitalClockSection-root");

        // Only handle arrow keys when specifically focused on time sections
        if (
          timeSection?.contains(target) &&
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          target === document.activeElement
        ) {
          // Don't prevent default - let normal keyboard navigation work
          const scrollAmount = e.key === "ArrowDown" ? 40 : -40;
          requestAnimationFrame(() => {
            timeSection.scrollBy({
              top: scrollAmount,
              behavior: "smooth",
            });
          });
        }
      };

      // Clean up any tooltips and make sections focusable
      const cleanupAndSetupSections = () => {
        // Remove tooltips from all time picker related elements
        const allTimePickerElements = document.querySelectorAll(
          ".MuiMultiSectionDigitalClockSection-root, " +
            ".MuiMultiSectionDigitalClockSection-root *, " +
            ".MuiPickersPopper-root, " +
            ".MuiPickersPopper-root *, " +
            ".MuiTimePicker-root, " +
            ".MuiTimePicker-root *"
        );

        allTimePickerElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          // Remove any title attributes that cause tooltips
          htmlElement.removeAttribute("title");
          htmlElement.removeAttribute("aria-label");
          // Remove any data attributes that might trigger tooltips
          htmlElement.removeAttribute("data-title");
          htmlElement.removeAttribute("data-tooltip");
        });

        // Make time sections focusable for keyboard navigation
        const timeSections = document.querySelectorAll(".MuiMultiSectionDigitalClockSection-root");
        timeSections.forEach((section) => {
          const element = section as HTMLElement;
          element.tabIndex = 0;
          element.removeAttribute("title");
        });
      };

      // Minimal setup - just remove tooltips, don't interfere with interactions
      const setupMinimalEnhancements = () => {
        // Only remove tooltips, don't add any event listeners that might interfere
        const actionBarButtons = document.querySelectorAll(
          ".MuiPickersActionBar-root .MuiButton-root"
        );
        actionBarButtons.forEach((button) => {
          const buttonElement = button as HTMLElement;
          // Only remove tooltips
          buttonElement.removeAttribute("title");
        });
      };

      // Run minimal cleanup multiple times to catch dynamically added elements
      const cleanupTimeout1 = setTimeout(() => {
        cleanupAndSetupSections();
        setupMinimalEnhancements();
      }, 50);
      const cleanupTimeout2 = setTimeout(() => {
        cleanupAndSetupSections();
        setupMinimalEnhancements();
      }, 200);
      const cleanupTimeout3 = setTimeout(() => {
        cleanupAndSetupSections();
        setupMinimalEnhancements();
      }, 500);

      // Add minimal event listeners - only for enhancement, not blocking
      document.addEventListener("wheel", handleWheelScroll, { passive: true });
      document.addEventListener("keydown", handleKeyDown, { passive: true });

      return () => {
        clearTimeout(cleanupTimeout1);
        clearTimeout(cleanupTimeout2);
        clearTimeout(cleanupTimeout3);
        document.removeEventListener("wheel", handleWheelScroll);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }

    // Return undefined when isOpen is false
    return undefined;
  }, [isOpen]);

  const theme = React.useMemo(() => createCustomTheme(isDark), [isDark]);

  // Convert string time to Dayjs object
  const timeValue = React.useMemo(() => {
    if (!value) return null;
    const [hours, minutes] = value.split(":");
    return dayjs()
      .hour(Number.parseInt(hours || "0", 10))
      .minute(Number.parseInt(minutes || "0", 10));
  }, [value]);

  const handleTimeChange = React.useCallback(
    (newTime: Dayjs | null) => {
      if (newTime && onChange) {
        const hours = newTime.hour().toString().padStart(2, "0");
        const minutes = newTime.minute().toString().padStart(2, "0");
        onChange(`${hours}:${minutes}`);
      }
    },
    [onChange]
  );

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          enableAccessibleFieldDOMStructure={false}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                id={id}
                placeholder={placeholder}
                className={cn("w-full", className)}
                variant="outlined"
                size="small"
                onClick={() => setIsOpen(true)}
              />
            ),
          }}
          slotProps={{
            popper: {
              placement: "bottom-start",
              // Fix z-index issues with dialog modals
              sx: {
                zIndex: 9999, // Higher than dialog z-index (z-50 = 50)
                "& .MuiPaper-root": {
                  zIndex: 9999,
                },
              },
              // Ensure popper is rendered in the correct container
              container: typeof document !== "undefined" ? document.body : undefined,
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 4],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                    padding: 8,
                  },
                },
                {
                  name: "flip",
                  options: {
                    fallbackPlacements: ["top-start", "bottom-end", "top-end"],
                  },
                },
              ],
              // Remove event interference - let all interactions work normally
            },
            // Configure action bar for OK/Cancel buttons
            actionBar: {
              sx: {
                zIndex: 10000, // Higher than popper
                "& .MuiButton-root": {
                  pointerEvents: "auto !important",
                  zIndex: 10001,
                  cursor: "pointer !important",
                  position: "relative",
                  isolation: "isolate",
                },
              },
            },
            // Ensure proper event handling for desktop paper
            desktopPaper: {
              sx: {
                zIndex: 9999,
                "& .MuiPickersActionBar-root": {
                  zIndex: 10000,
                  "& .MuiButton-root": {
                    pointerEvents: "auto !important",
                    zIndex: 10001,
                  },
                },
              },
              // Remove event blocking - let all interactions work normally
            },
            // Clock component styling and event handling
            digitalClockSectionItem: {
              sx: {
                "&:hover": {
                  backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
