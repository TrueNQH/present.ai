"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSlideChangeWatcher } from "@/hooks/presentation/useSlideChangeWatcher";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SlidePreviewRenderer } from "./SlidePreviewRenderer";
import { usePresentationSlides } from "@/hooks/presentation/usePresentationSlides";
import { type TElement } from "@udecode/plate-common";
import { usePresentationState } from "@/states/presentation-state";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { SlideContainer } from "./SlideContainer";
import PresentationEditor from "../editor/presentation-editor";

interface PresentationSlidesViewProps {
  handleSlideChange: (value: TElement[], index: number) => void;
  isGeneratingPresentation: boolean;
}

export const PresentationSlidesView = ({
  handleSlideChange,
  isGeneratingPresentation,
}: PresentationSlidesViewProps) => {
  const {
    currentSlideIndex,
    isPresenting,
    nextSlide,
    previousSlide,
    setShouldShowExitHeader,
  } = usePresentationState();
  const { items, sensors, handleDragEnd } = usePresentationSlides();
  // Use the slide change watcher to automatically save changes
  useSlideChangeWatcher({ debounceDelay: 600 });
  // Handle keyboard navigation in presentation mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPresenting) return;
      if (event.key === "ArrowRight" || event.key === "Space") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        previousSlide();
      } else if (event.key === "Escape") {
        usePresentationState.getState().setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, previousSlide, isPresenting]);

  // Handle showing header on mouse move
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY < 100) {
        setShouldShowExitHeader(true);
      } else {
        setShouldShowExitHeader(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <DndProvider backend={HTML5Backend}>
          {items.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-wrapper slide-wrapper-${index}`}
            >
              <SlideContainer index={index} id={slide.id}>
                <div
                  className={cn(
                    `slide-container-${index}`,
                    isPresenting && "h-screen w-screen"
                  )}
                >
                  <PresentationEditor
                    initialContent={slide}
                    className={cn(
                      "min-h-[300px] rounded-md border",
                      isPresenting && "h-screen w-screen"
                    )}
                    id={slide.id}
                    autoFocus={index === currentSlideIndex}
                    slideIndex={index}
                    onChange={(value) => handleSlideChange(value, index)}
                    isGenerating={isGeneratingPresentation}
                    readOnly={isPresenting}
                  />
                </div>
              </SlideContainer>

              {/* Create preview directly in the markup */}
              <SlidePreviewRenderer slideIndex={index} slideId={slide.id}>
                <PresentationEditor
                  initialContent={slide}
                  className="min-h-[300px] border"
                  id={`preview-${slide.id}`}
                  isPreview={true}
                  readOnly={true}
                  slideIndex={index}
                  onChange={() => {
                    // Test
                  }}
                  isGenerating={isGeneratingPresentation}
                />
              </SlidePreviewRenderer>
            </div>
          ))}
        </DndProvider>
      </SortableContext>
    </DndContext>
  );
};
