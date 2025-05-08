"use client";

import React from "react";

import type { PlateElementProps } from "@udecode/plate-common/react";

import { cn } from "@udecode/cn";
import { PlateElement as PlateElementPrimitive } from "@udecode/plate-common/react";
import { BlockSelection } from "@/components/text-editor/plate-ui/block-selection";

export const PresentationElement = React.forwardRef<
  HTMLDivElement,
  PlateElementProps
>(({ children, className, ...props }: PlateElementProps, ref) => {
  return (
    <PlateElementPrimitive
      ref={ref}
      className={cn("presentation-element relative !select-text", className)}
      {...props}
    >
      {children}

      {className?.includes("slate-selectable") && <BlockSelection />}
    </PlateElementPrimitive>
  );
});

PresentationElement.displayName = "PresentationElement";
