"use client";

import React from "react";
import { cn } from "@udecode/cn";
import { useDraggable, useDropLine } from "@udecode/plate-dnd";
import { GripVertical } from "lucide-react";
import { useReadOnly } from "slate-react";
import { useEditorPlugin } from "@udecode/plate/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { Button } from "@/components/text-editor/plate-ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/text-editor/plate-ui/tooltip";
import { type TElement } from "@udecode/plate-common";
import { VISUALIZATION_ITEM_ELEMENT } from "./visualization-item-plugin";

// PyramidItem component for individual items in the pyramid
export const PyramidItem = ({
  index,
  totalItems,
  element,
  children,
}: {
  index: number;
  totalItems: number;
  element: TElement;
  children: React.ReactNode;
}) => {
  const readOnly = useReadOnly();
  const { useOption } = useEditorPlugin(BlockSelectionPlugin);
  const isSelectionAreaVisible = useOption("isSelectionAreaVisible");

  // Add draggable functionality
  const { isDragging, previewRef, handleRef } = useDraggable({
    element,
    orientation: "vertical",
    id: element.id as string,
    canDropNode: ({ dragEntry, dropEntry }) => {
      return (
        dragEntry[0].type === VISUALIZATION_ITEM_ELEMENT &&
        dropEntry[0].type === VISUALIZATION_ITEM_ELEMENT
      );
    },
  });

  // Add drop line indicator
  const { dropLine } = useDropLine({
    id: element.id as string,
    orientation: "vertical",
  });

  // Constants for shape sizes
  const shapeHeight = 80;
  const maxWidthPercentage = 80; // Maximum width the bottom layer should take up
  const increment = maxWidthPercentage / (2 * totalItems);

  // Calculate clip path using the provided algorithm
  const calculateClipPath = () => {
    if (index === 0) {
      // First layer is a triangle
      return `polygon(50% 0%, ${50 - increment}% 100%, ${50 + increment}% 100%)`;
    } else {
      // For other layers
      const prevXOffset = increment * index;
      const currentXOffset = increment * (index + 1);

      const prevBottomLeft = 50 - prevXOffset;
      const prevBottomRight = 50 + prevXOffset;

      const currentBottomLeft = 50 - currentXOffset;
      const currentBottomRight = 50 + currentXOffset;

      return `polygon(${prevBottomLeft}% 0%, ${prevBottomRight}% 0%, ${currentBottomRight}% 100%, ${currentBottomLeft}% 100%)`;
    }
  };

  const calculateLeftOffset = () => {
    return (40 - (index + 1) * increment) * 0.5;
  };

  const clipPath = calculateClipPath();

  return (
    <div
      ref={previewRef}
      className={cn(
        "group/pyramid-item relative w-full",
        isDragging && "opacity-50",
        dropLine && "drop-target",
      )}
    >
      {/* Drop target indicator lines */}
      {!readOnly && !isSelectionAreaVisible && dropLine && (
        <div
          className={cn(
            "absolute z-50 bg-primary/50",
            dropLine === "top" && "inset-x-0 top-0 h-1",
            dropLine === "bottom" && "inset-x-0 bottom-0 h-1",
          )}
        />
      )}

      {/* Drag handle that appears on hover */}
      {!readOnly && !isSelectionAreaVisible && (
        <div
          ref={handleRef}
          className={cn(
            "absolute left-0 top-1/2 z-50 -translate-x-full -translate-y-1/2 pr-2",
            "pointer-events-auto flex items-center",
            "opacity-0 transition-opacity group-hover/pyramid-item:opacity-100",
          )}
        >
          <PyramidItemDragHandle />
        </div>
      )}

      {/* The pyramid item layout */}
      <div className="flex items-center border-b border-gray-700">
        {/* Shape with number */}
        <div className="relative flex-1">
          <div
            className="grid place-items-center text-2xl font-bold"
            style={{
              height: `${shapeHeight}px`,
              clipPath: clipPath,
              backgroundColor: "var(--presentation-primary)",
              color: "var(--presentation-background)",
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* Content area with proper vertical alignment and negative margin */}
        <div
          className="relative flex flex-1 items-center"
          style={{
            minHeight: `${shapeHeight}px`,
            right: `${calculateLeftOffset()}%`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Drag handle component
const PyramidItemDragHandle = React.memo(() => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="none" variant="ghost" className="h-5 px-1">
            <GripVertical
              className="size-4 text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Drag to move item</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
});
PyramidItemDragHandle.displayName = "PyramidItemDragHandle";
