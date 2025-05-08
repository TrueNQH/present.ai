"use client";

import React, { type ReactNode } from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Import BulletItem and constants
import { BulletItem } from "./bullet-item";
import { BULLET_ELEMENT, BULLETS_ELEMENT } from "../lib";

export interface BulletsElement extends TElement {
  type: typeof BULLETS_ELEMENT;
}

// Main bullets component with withRef pattern
export const BulletsElement = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children as ReactNode);
    const items = element.children;

    // Determine number of columns based on item count
    const getColumnClass = () => {
      const count = items.length;
      if (count <= 1) return "grid-cols-1";
      if (count <= 2) return "grid-cols-2";
      return "grid-cols-3"; // Max 3 columns
    };

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("my-6", className)}
        {...props}
      >
        {/* Grid layout with adaptive columns */}
        <div className={cn("grid gap-6", getColumnClass())}>
          {childrenArray.map((child, index) => (
            <BulletItem
              key={index}
              index={index}
              element={items[index] as TElement}
            >
              {child}
            </BulletItem>
          ))}
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for bullets
export const BulletsPlugin = createPlatePlugin({
  key: BULLETS_ELEMENT,
  node: {
    isElement: true,
    type: BULLETS_ELEMENT,
    component: BulletsElement,
  },
});

// Create plugin for bullet item
export const BulletPlugin = createPlatePlugin({
  key: BULLET_ELEMENT,
  node: {
    isElement: true,
    type: BULLET_ELEMENT,
  },
});
