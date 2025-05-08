"use client";

import React, { type ReactNode } from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Import CycleItem and constants
import { CycleItem } from "./cycle-item";
import { CYCLE_ITEM_ELEMENT, CYCLE_ELEMENT } from "../lib";

export interface CycleElement extends TElement {
  type: typeof CYCLE_ELEMENT;
}

// Main cycle component with withRef pattern
export const CycleElement = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children as ReactNode);
    const items = element.children;
    const totalItems = items.length;
    const hasOddItems = totalItems % 2 !== 0;

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("relative my-8", className)}
        {...props}
      >
        {/* Three-column grid layout for content */}
        <div className="mx-auto grid grid-cols-3 gap-4 px-12">
          {/* Central SVG wheel */}

          <div className="relative col-start-2 row-span-2 row-start-2 mx-auto h-64 w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              className="fill-primary"
              viewBox="0 0 100 125"
              x="0px"
              y="0px"
            >
              <path d="M23.25569,25.04785,28.119,36.65509A25.64562,25.64562,0,0,1,49.3597,24.379l7.62158-10.01624L49.384,4.37842A45.65079,45.65079,0,0,0,10.81752,26.63416Z" />
              <path d="M89.82619,27.75232,84.98225,39.31543,72.50014,37.72351a25.59208,25.59208,0,0,1,.01,24.536l4.86279,11.60571,12.43573-1.58667a45.49257,45.49257,0,0,0,.01758-44.52624Z" />
              <path d="M58.23714,14.36279,50.61586,24.37842A25.64474,25.64474,0,0,1,71.86818,36.635l12.48517,1.59253L89.199,26.66272A45.65056,45.65056,0,0,0,50.64009,4.379Z" />
              <path d="M76.744,74.95312,71.88106,63.34521A25.64518,25.64518,0,0,1,50.64033,75.62146L43.01839,85.6377,50.616,95.62207a45.65067,45.65067,0,0,0,38.5661-22.25525Z" />
              <path d="M15.01839,60.68555,27.50026,62.2774a25.59173,25.59173,0,0,1-.01013-24.53686l-4.86335-11.6048L10.19136,27.72192a45.49238,45.49238,0,0,0-.01764,44.52582Z" />
              <path d="M41.76253,85.6377l7.62164-10.01563A25.6444,25.6444,0,0,1,28.13258,63.36646l-12.48529-1.593L10.801,73.33752a45.65051,45.65051,0,0,0,38.5589,22.28394Z" />
            </svg>
          </div>

          {childrenArray.map((child, index) => {
            // For odd total count, make first item (index 0) start from middle column
            let columnStart: string;

            if (hasOddItems && index === 0) {
              // First item in the middle for odd total
              columnStart = "col-start-2";
            } else {
              // Otherwise alternate between left and right columns
              // If odd total, adjust indexes to account for first item being in middle
              const adjustedIndex = hasOddItems ? index - 1 : index;
              columnStart =
                adjustedIndex % 2 === 0 ? "col-start-1" : "col-start-3";
            }

            return (
              <div key={index} className={cn("col-span-1", columnStart)}>
                <CycleItem
                  index={index}
                  totalItems={totalItems}
                  element={items[index] as TElement}
                >
                  {child}
                </CycleItem>
              </div>
            );
          })}
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for cycle
export const CyclePlugin = createPlatePlugin({
  key: CYCLE_ELEMENT,
  node: {
    isElement: true,
    type: CYCLE_ELEMENT,
    component: CycleElement,
  },
});

// Create plugin for cycle item
export const CycleItemPlugin = createPlatePlugin({
  key: CYCLE_ITEM_ELEMENT,
  node: {
    isElement: true,
    type: CYCLE_ITEM_ELEMENT,
  },
});
