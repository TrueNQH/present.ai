"use client";

import React from "react";
import { cn, useComposedRef, withRef } from "@udecode/cn";
import { useDraggable, useDropLine } from "@udecode/plate-dnd";
import { ResizableProvider } from "@udecode/plate-resizable";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { PlateElement, useEditorPlugin, withHOC } from "@udecode/plate/react";
import { GripHorizontal } from "lucide-react";
import { useReadOnly } from "slate-react";
import { type TColumnElement } from "@udecode/plate-layout";
import { type TElement } from "@udecode/plate-common";

import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const ColumnElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>((props, ref) => {
    const element = props.element as TElement & TColumnElement;
    const { width } = element;
    const readOnly = useReadOnly();
    const { useOption } = useEditorPlugin(BlockSelectionPlugin);
    const isSelectionAreaVisible = useOption("isSelectionAreaVisible");

    const { isDragging, previewRef, handleRef } = useDraggable({
      element: props.element,
      orientation: "horizontal",
      type: "column",
      canDropNode: ({ dragEntry, dropEntry }) => {
        return dragEntry[0].type === "column" && dropEntry[0].type === "column";
      },
    });

    const { dropLine } = useDropLine({
      id: element.id!,
      orientation: "horizontal",
    });

    return (
      <div
        className={cn(
          "group/column relative",
          isDragging && "opacity-50",
          dropLine && "drop-target",
        )}
        style={{ width: width ?? "100%" }}
      >
        {!readOnly && !isSelectionAreaVisible && (
          <div
            ref={handleRef}
            className={cn(
              "absolute left-1/2 top-2 z-50 -translate-x-1/2 -translate-y-1/2",
              "pointer-events-auto flex items-center",
              "opacity-0 transition-opacity group-hover/column:opacity-100",
            )}
          >
            <ColumnDragHandle />
          </div>
        )}

        <PlateElement
          ref={useComposedRef(ref, previewRef)}
          className={cn(
            props.className,
            "h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0",
            "min-w-0 flex-1",
          )}
          {...props}
        >
          <div
            className={cn(
              "relative flex h-full flex-col  justify-center  p-1.5",
              !readOnly &&
                "rounded-lg border  border-dashed border-transparent group-hover/column:border-border",
            )}
          >
            {props.children}

            {!readOnly && !isSelectionAreaVisible && dropLine && (
              <div
                className={cn(
                  "absolute bg-primary/50",
                  dropLine === "left" &&
                    "inset-y-0 left-[-2px] w-1 group-first/column:-left-1",
                  dropLine === "right" &&
                    "inset-y-0 right-[-2px] w-1 group-last/column:-right-1",
                )}
              />
            )}
          </div>
        </PlateElement>
      </div>
    );
  }),
);

const ColumnDragHandle = React.memo(() => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="none" variant="ghost" className="h-5 px-1">
            <GripHorizontal
              className="size-4 text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Drag to move column</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
});
ColumnDragHandle.displayName = "ColumnDragHandle";
