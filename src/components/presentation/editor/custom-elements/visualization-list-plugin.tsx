"use client";

import React from "react";
import { cn, withRef } from "@udecode/cn";
import { type TDescendant, type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Import draggable item components
import { PyramidItem } from "./pyramid-item";
import { ArrowItem } from "./arrow-item";
import { TimelineItem } from "./timeline-item";

// Define visualization list element type
export const VISUALIZATION_LIST_ELEMENT = "visualization-list";

export interface VisualizationListElement extends TElement {
  type: typeof VISUALIZATION_LIST_ELEMENT;
  visualizationType: "pyramid" | "arrow" | "timeline";
}

// Pyramid visualization with draggable items
const PyramidVisualization = ({
  items,
  children,
}: {
  items: TDescendant[];
  children: React.ReactNode;
}) => {
  const childrenArray = React.Children.toArray(children);
  const totalItems = items.length;

  return (
    <div className="my-8 flex w-full flex-col items-center gap-2">
      {childrenArray.map((child, index) => (
        <PyramidItem
          key={index}
          index={index}
          totalItems={totalItems}
          element={items[index] as TElement}
        >
          {child}
        </PyramidItem>
      ))}
    </div>
  );
};

// Arrow visualization with draggable items
const ArrowVisualization = ({
  items,
  children,
}: {
  items: TDescendant[];
  children: React.ReactNode;
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="my-4 mb-8 flex w-full flex-col overflow-visible">
      {childrenArray.map((child, index) => (
        <ArrowItem key={index} index={index} element={items[index] as TElement}>
          {child}
        </ArrowItem>
      ))}
    </div>
  );
};

// Timeline visualization with draggable items
const TimelineVisualization = ({
  items,
  children,
}: {
  items: TDescendant[];
  children: React.ReactNode;
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="relative mx-4">
      {/* Vertical line */}
      <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-300"></div>

      {/* Events */}
      <div className="space-y-8">
        {childrenArray.map((child, index) => (
          <TimelineItem
            key={index}
            index={index}
            element={items[index] as TElement}
          >
            {child}
          </TimelineItem>
        ))}
      </div>
    </div>
  );
};

// Main visualization list component with withRef pattern
export const VisualizationListElement = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    const { visualizationType } = element as VisualizationListElement;

    const renderVisualization = () => {
      switch (visualizationType) {
        case "pyramid":
          return (
            <PyramidVisualization items={element.children}>
              {children}
            </PyramidVisualization>
          );
        case "arrow":
          return (
            <ArrowVisualization items={element.children}>
              {children}
            </ArrowVisualization>
          );
        case "timeline":
          return (
            <TimelineVisualization items={element.children}>
              {children}
            </TimelineVisualization>
          );
        default:
          return <div>{children}</div>;
      }
    };

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("my-4", className)}
        {...props}
      >
        {renderVisualization()}
      </PlateElement>
    );
  },
);

// Create plugin for visualization list
export const VisualizationListPlugin = createPlatePlugin({
  key: VISUALIZATION_LIST_ELEMENT,
  node: {
    isElement: true,
    type: VISUALIZATION_LIST_ELEMENT,
    component: VisualizationListElement,
  },
  options: {
    visualizationType: "arrow",
  },
});
