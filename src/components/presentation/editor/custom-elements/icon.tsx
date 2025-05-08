"use client";

import React from "react";
import { cn, withRef } from "@udecode/cn";
import { findNode, type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";
import { useEditorRef } from "@udecode/plate-common/react";
import { setNodes } from "@udecode/plate-common";

import { ICON_ELEMENT } from "../lib";
import { IconPicker } from "@/components/ui/icon-picker";

export interface IconElement extends TElement {
  type: typeof ICON_ELEMENT;
  query: string;
  name: string;
}

// Icon component that uses IconPicker
export const IconElementComponent = withRef<typeof PlateElement>(
  ({ element, className, ...props }, ref) => {
    const { query, name } = element as IconElement;
    const editor = useEditorRef();

    // Handle icon selection
    const handleIconSelect = (iconName: string) => {
      const nodeWithPath = findNode(editor, { match: { id: element.id } });
      if (!nodeWithPath) return;
      const [, path] = nodeWithPath;
      console.log(element, iconName);
      setNodes<IconElement>(editor, { name: iconName }, { at: path });
    };

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("inline-flex justify-center", className)}
        {...props}
      >
        <div className="mb-2 p-2">
          {name ? (
            <IconPicker
              defaultIcon={name}
              onIconSelect={(iconName) => handleIconSelect(iconName)}
            />
          ) : (
            <IconPicker
              searchTerm={query}
              onIconSelect={(iconName) => handleIconSelect(iconName)}
            />
          )}
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for icon
export const IconPlugin = createPlatePlugin({
  key: ICON_ELEMENT,
  node: {
    isElement: true,
    type: ICON_ELEMENT,
    component: IconElementComponent,
  },
});
