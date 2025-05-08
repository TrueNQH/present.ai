"use client";

import React, { type ReactNode } from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Import StairItem and constants
import { StairItem } from "./staircase-item";
import { STAIR_ITEM_ELEMENT, STAIRCASE_ELEMENT } from "../lib";

export interface StaircaseElement extends TElement {
  type: typeof STAIRCASE_ELEMENT;
}

// Main staircase component with withRef pattern
export const StaircaseElement = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children as ReactNode);
    const items = element.children;
    const totalItems = items.length;

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("my-8", className)}
        {...props}
      >
        <div>
          {childrenArray.map((child, index) => (
            <StairItem
              key={index}
              index={index}
              totalItems={totalItems}
              element={items[index] as TElement}
            >
              {child}
            </StairItem>
          ))}
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for staircase
export const StaircasePlugin = createPlatePlugin({
  key: STAIRCASE_ELEMENT,
  node: {
    isElement: true,
    type: STAIRCASE_ELEMENT,
    component: StaircaseElement,
  },
});

// Create plugin for stair item
export const StairItemPlugin = createPlatePlugin({
  key: STAIR_ITEM_ELEMENT,
  node: {
    isElement: true,
    type: STAIR_ITEM_ELEMENT,
  },
});
