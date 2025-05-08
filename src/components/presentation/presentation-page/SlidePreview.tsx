"use client";

import React from "react";
import { usePresentationState } from "@/states/presentation-state";
import { cn } from "@/lib/utils";

interface SlidePreviewProps {
  onSlideClick: (index: number) => void;
  currentSlideIndex: number;
}

export function SlidePreview({
  onSlideClick,
  currentSlideIndex,
}: SlidePreviewProps) {
  const { slides } = usePresentationState();

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="mb-2 text-sm font-semibold">Slides</h2>
      <div className="flex flex-col space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-md border transition-all hover:border-primary",
              currentSlideIndex === index
                ? "border-primary ring-1 ring-primary"
                : "border-muted",
            )}
            onClick={() => {
              console.log("clicked", index);
              onSlideClick(index);
            }}
          >
            <div className="absolute left-2 top-1 z-10 rounded-sm bg-muted px-1 py-0.5 text-xs font-medium text-muted-foreground">
              {index + 1}
            </div>
            <div
              id={`slide-preview-${index}`}
              className="pointer-events-none h-max min-h-9 w-full overflow-hidden bg-card"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
