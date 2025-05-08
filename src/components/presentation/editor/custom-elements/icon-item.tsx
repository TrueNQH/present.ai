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
import { ICON_ITEM_ELEMENT } from "../lib";

// IconItem component for individual items in the icons list
export const IconItem = ({
  element,
  children,
}: {
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
        dragEntry[0].type === ICON_ITEM_ELEMENT &&
        dropEntry[0].type === ICON_ITEM_ELEMENT
      );
    },
  });

  // Add drop line indicator
  const { dropLine } = useDropLine({
    id: element.id as string,
    orientation: "vertical",
  });

  return (
    <div
      ref={previewRef}
      className={cn(
        "group/icon-item relative w-full",
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
            "opacity-0 transition-opacity group-hover/icon-item:opacity-100",
          )}
        >
          <IconItemDragHandle />
        </div>
      )}

      {/* The icon item layout - vertical alignment with icon at top */}
      <div className="w-full [&>[data-slate-node=element]]:grid [&>[data-slate-node=element]]:grid-cols-[auto_1fr] [&>[data-slate-node=element]]:gap-[0px_1rem] [&>[data-slate-node=element]_*]:col-start-2 [&>[data-slate-node=element]_div]:col-start-1 [&>[data-slate-node=element]_div]:row-span-2 [&>[data-slate-node=element]_div]:flex [&>[data-slate-node=element]_div]:items-center [&>[data-slate-node=element]_div]:justify-center [&>[data-slate-node=element]_div]:self-center">
        {children}
      </div>
    </div>
  );
};

// Drag handle component
const IconItemDragHandle = React.memo(() => {
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
IconItemDragHandle.displayName = "IconItemDragHandle";
