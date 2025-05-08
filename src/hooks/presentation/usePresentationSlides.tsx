"use client";

import { useMemo, useCallback } from "react";
import { nanoid } from "nanoid";
import { usePresentationState } from "@/states/presentation-state";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { type PlateSlide } from "@/components/presentation/utils/parser";

interface SlideWithId extends PlateSlide {
  id: string;
}

export function usePresentationSlides() {
  const { slides, setSlides, isPresenting } = usePresentationState();

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ensure all slides have IDs
  const items = useMemo(
    () => slides.map((slide) => ({ ...slide, id: slide?.id ?? nanoid() })),
    [slides]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isPresenting) return; // Prevent drag when presenting

      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex(
          (item: SlideWithId) => item.id === active.id
        );
        const newIndex = items.findIndex(
          (item: SlideWithId) => item.id === over.id
        );
        const newArray = arrayMove(items, oldIndex, newIndex);
        setSlides([...newArray]);
      }
    },
    [items, isPresenting, setSlides]
  );

  // Scroll to a slide by index
  const scrollToSlide = useCallback((index: number) => {
    // Target the slide wrapper instead of slide container
    const slideElement = document.querySelector(`.slide-wrapper-${index}`);

    if (slideElement) {
      // Find the scrollable container
      const scrollContainer = document.querySelector(".presentation-slides");

      if (scrollContainer) {
        // Calculate the scroll position
        scrollContainer.scrollTo({
          top: (slideElement as HTMLElement).offsetTop - 30, // Add a small offset for better visibility
          behavior: "smooth",
        });

        setTimeout(() => {
          // Focus the editor after scrolling
          // Try to find and focus the editor within the slide container
          const editorElement = slideElement.querySelector(
            "[contenteditable=true]"
          );
          if (editorElement instanceof HTMLElement) {
            editorElement.focus();
          }
        }, 500);
      }
    }
  }, []);

  return {
    items,
    sensors,
    isPresenting,
    handleDragEnd,
    scrollToSlide,
  };
}
