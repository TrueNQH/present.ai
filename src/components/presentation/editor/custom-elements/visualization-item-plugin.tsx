"use client";

import React from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Define visualization item element type
export const VISUALIZATION_ITEM_ELEMENT = "visualization-item";

export interface VisualizationItemElement extends TElement {
  type: typeof VISUALIZATION_ITEM_ELEMENT;
}

// Main visualization item component with withRef pattern
export const VisualizationItemElementComponent = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn(className)}
        {...props}
      >
        <div className="flex flex-col">{children}</div>
      </PlateElement>
    );
  },
);

// Create plugin for visualization item
export const VisualizationItemPlugin = createPlatePlugin({
  key: VISUALIZATION_ITEM_ELEMENT,
  node: {
    isElement: true,
    type: VISUALIZATION_ITEM_ELEMENT,
    component: VisualizationItemElementComponent,
  },
});
