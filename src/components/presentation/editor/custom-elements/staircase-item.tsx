"use client";

import React from "react";
import { cn } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
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
import { STAIR_ITEM_ELEMENT } from "../lib";

// StairItem component for individual items in the staircase
export const StairItem = ({
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
        dragEntry[0].type === STAIR_ITEM_ELEMENT &&
        dropEntry[0].type === STAIR_ITEM_ELEMENT
      );
    },
  });

  // Add drop line indicator
  const { dropLine } = useDropLine({
    id: element.id as string,
    orientation: "vertical",
  });

  // Calculate width based on index and total items
  const getWidth = () => {
    const baseWidth = 70; // Base width for first step
    const maxWidth = 220; // Maximum width for the last step

    // Calculate width increment based on total items
    const increment = (maxWidth - baseWidth) / (totalItems - 1 || 1);

    return baseWidth + index * increment;
  };

  return (
    <div
      ref={previewRef}
      className={cn(
        "group/stair-item relative mb-2 w-full",
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
            "opacity-0 transition-opacity group-hover/stair-item:opacity-100",
          )}
        >
          <StairItemDragHandle />
        </div>
      )}

      {/* The stair item layout */}
      <div className="flex gap-4">
        {/* Square block with increasing width but fixed height */}
        <div
          style={{
            width: `${getWidth()}px`,
            minHeight: "70px",
            backgroundColor: "var(--presentation-primary)",
            color: "var(--presentation-background)",
          }}
          className="flex flex-shrink-0 items-center justify-center rounded-md text-2xl font-bold"
        >
          {index + 1}
        </div>

        {/* Content area */}
        <div className="flex flex-1 items-center">{children}</div>
      </div>
    </div>
  );
};

// Drag handle component
const StairItemDragHandle = React.memo(() => {
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
StairItemDragHandle.displayName = "StairItemDragHandle";
