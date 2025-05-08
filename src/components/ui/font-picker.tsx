"use client";
import "./font-picker.css";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Font } from "react-fontpicker-ts";
import { Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

// Using dynamic import since the font picker uses browser APIs
const FontPicker = dynamic(
  () => import("react-fontpicker-ts").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-10 items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="mr-2 animate-spin" />
        <span>Loading fonts...</span>
      </div>
    ),
  },
);

export interface FontPickerSpecificProps {
  value?: string;
  defaultValue?: string;
  onChange?: (font: string) => void;
  mode?: "combo" | "list";
  autoLoad?: boolean;
  loadAllVariants?: boolean;
  inputId?: string;
  googleFonts?: string[] | ((font: Font) => boolean);
  fontCategories?: string[] | string;
  noMatches?: string;
  loadFonts?: string | string[];
  loaderOnly?: boolean;
}

export type FontPickerProps = FontPickerSpecificProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

const FontPickerComponent = React.forwardRef<HTMLDivElement, FontPickerProps>(
  (
    {
      value,
      defaultValue = "Inter",
      onChange,
      mode = "combo",
      autoLoad = true,
      loadAllVariants = false,
      inputId = "font-picker",
      googleFonts,
      fontCategories,
      noMatches = "No matching fonts found",
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [selectedFont, setSelectedFont] = useState(value ?? defaultValue);
    const isMounted = useRef(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const dynamicComponentLoaded = useRef(false);
    const [componentReady, setComponentReady] = useState(false);

    // Use this to prevent auto-closing when component mounts
    useEffect(() => {
      isMounted.current = true;

      return () => {
        isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      if (value) {
        setSelectedFont(value);
      }
    }, [value]);

    // Reset component ready state when popover opens/closes
    useEffect(() => {
      if (!open) {
        // Reset for next open
        setComponentReady(false);
      }
    }, [open]);

    // This effect runs when the popover opens and the dynamic component is loaded
    useEffect(() => {
      if (open) {
        // If the dynamic component has already been loaded in a previous session
        if (dynamicComponentLoaded.current) {
          setComponentReady(true);
        } else {
          // Otherwise we need to wait for the component to load for the first time
          // Using a short delay to ensure the dynamic component has rendered
          const timeout = setTimeout(() => {
            if (popoverRef.current) {
              // Check if the actual font picker component exists in the DOM
              const fontPickerElement =
                popoverRef.current.querySelector(".fontpicker");
              if (fontPickerElement) {
                dynamicComponentLoaded.current = true;
                setComponentReady(true);
              }
            }
          }, 100);

          return () => clearTimeout(timeout);
        }
      }
    }, [open]);

    // Auto-focus the search input when popover opens AND component is ready
    useEffect(() => {
      if (open && componentReady && popoverRef.current) {
        // Short delay to ensure the content is fully rendered
        const timeoutId = setTimeout(() => {
          if (popoverRef.current) {
            const searchInput = popoverRef.current.querySelector(
              ".fontpicker__search",
            );
            if (searchInput instanceof HTMLInputElement) {
              searchInput.focus();
            }
          }
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }, [open, componentReady]);

    const handleFontChange = (font: string) => {
      setSelectedFont(font);
      if (onChange) {
        onChange(font);
      }
    };

    // Prevent clicks inside popover from closing parent floating toolbars
    const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    // In list mode, render the original component
    if (mode === "list") {
      return (
        <div ref={ref} className={cn(className)} {...props}>
          <FontPicker
            inputId={inputId}
            mode="list"
            autoLoad={autoLoad}
            loadAllVariants={loadAllVariants}
            defaultValue={value ?? defaultValue}
            value={handleFontChange}
            googleFonts={googleFonts}
            fontCategories={fontCategories}
            noMatches={noMatches}
          />
        </div>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontFamily: selectedFont }}>
              {selectedFont || defaultValue}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[200px] p-0"
          align="start"
          onClick={handleContentClick}
          onMouseDown={(e) => e.stopPropagation()}
          ref={popoverRef}
        >
          <div
            className="h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="font-picker-popover"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <FontPicker
                inputId={inputId}
                mode="combo" // Force list mode inside popover
                autoLoad={autoLoad}
                loadAllVariants={loadAllVariants}
                defaultValue={value ?? defaultValue}
                value={handleFontChange}
                googleFonts={googleFonts}
                fontCategories={fontCategories}
                noMatches={noMatches}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

FontPickerComponent.displayName = "FontPicker";

export { FontPickerComponent as FontPicker };
