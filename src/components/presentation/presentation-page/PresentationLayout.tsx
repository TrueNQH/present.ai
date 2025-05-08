"use client";

import React, { useState, useCallback } from "react";
import { usePresentationState } from "@/states/presentation-state";
import { SlidePreview } from "./SlidePreview";
import { CustomThemeFontLoader } from "./FontLoader";
import { LoadingState } from "./Loading";
import { Resizable } from "re-resizable";
import { GripVertical } from "lucide-react";
import { usePresentationSlides } from "@/hooks/presentation/usePresentationSlides";
import { type ThemeProperties } from "@/lib/presentation/themes";
import { ThemeBackground } from "../theme/ThemeBackground";

interface PresentationLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  themeData?: ThemeProperties;
}

export function PresentationLayout({
  children,
  isLoading = false,
  themeData,
}: PresentationLayoutProps) {
  const { currentSlideIndex, setCurrentSlideIndex } = usePresentationState();
  const [sidebarWidth, setSidebarWidth] = useState(150);

  const { scrollToSlide } = usePresentationSlides();

  const handleSlideClick = useCallback(
    (index: number) => {
      setCurrentSlideIndex(index);
      scrollToSlide(index);
    },
    [scrollToSlide, setCurrentSlideIndex]
  );

  const handleResize = useCallback(
    (_e: unknown, _direction: unknown, _ref: unknown, d: { width: number }) => {
      setSidebarWidth((prev) => prev + d.width);
    },
    []
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ThemeBackground className="h-full w-full">
      {themeData && <CustomThemeFontLoader themeData={themeData} />}
      <div className="flex h-full">
        <div className="flex h-full items-center">
          <Resizable
            size={{ width: sidebarWidth }}
            minWidth={100}
            maxWidth={300}
            enable={{ right: true }}
            onResizeStop={handleResize}
            handleComponent={{
              right: (
                <div className="group/resize relative flex h-full w-1 cursor-col-resize bg-border">
                  <GripVertical className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover/resize:opacity-100" />
                </div>
              ),
            }}
          >
            <div className="h-max max-h-[90vh] overflow-auto">
              <SlidePreview
                onSlideClick={handleSlideClick}
                currentSlideIndex={currentSlideIndex}
              />
            </div>
          </Resizable>
        </div>

        {/* Main Presentation Content - Scrollable */}
        <div className="presentation-slides max-h-full flex-1 overflow-auto pb-20">
          {children}
        </div>
      </div>
    </ThemeBackground>
  );
}
