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
import { CYCLE_ITEM_ELEMENT } from "../lib";

// CycleItem component for individual items in the cycle
export const CycleItem = ({
  index,
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
        dragEntry[0].type === CYCLE_ITEM_ELEMENT &&
        dropEntry[0].type === CYCLE_ITEM_ELEMENT
      );
    },
  });

  // Add drop line indicator
  const { dropLine } = useDropLine({
    id: element.id as string,
    orientation: "vertical",
  });

  // Calculate item color based on index
  const getItemColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div
      ref={previewRef}
      className={cn(
        "group/cycle-item relative mb-6",
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
            "absolute left-0 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 pr-2",
            "pointer-events-auto flex items-center",
            "opacity-0 transition-opacity group-hover/cycle-item:opacity-100",
          )}
        >
          <CycleItemDragHandle />
        </div>
      )}

      {/* Content container with heading */}
      <div className="rounded-md border border-primary/20 bg-card p-4 shadow-sm">
        {/* Heading with number */}
        <div className="mb-2 flex items-center">
          <div
            className={cn(
              "mr-3 flex h-8 w-8 items-center justify-center rounded-full text-white",
              getItemColor(),
            )}
          >
            {index + 1}
          </div>
        </div>

        {/* Content area */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

// Drag handle component
const CycleItemDragHandle = React.memo(() => {
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
CycleItemDragHandle.displayName = "CycleItemDragHandle";
