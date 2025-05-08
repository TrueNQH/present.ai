"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FontFamilyPlugin } from "@udecode/plate-font/react";
import type { PlateEditor } from "@udecode/plate-common/react";
import "react-fontpicker-ts/dist/index.css";

// Using dynamic import since FontPicker uses browser APIs
const FontPicker = dynamic(
  () => import("react-fontpicker-ts").then((mod) => mod.default),
  { ssr: false },
);

interface FontLoaderProps {
  editor: PlateEditor;
}

export const FontLoader = ({ editor }: FontLoaderProps) => {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  // Scan the editor for all font families on initialization
  useEffect(() => {
    if (!editor) return;

    const fontFamilies = new Set<string>();

    // Scan all nodes for font family marks
    try {
      for (const [node] of editor.nodes({
        at: [],
        match: (n) => {
          const nodeWithFont = n as { text?: string; [key: string]: unknown };
          return Boolean(
            nodeWithFont.text && nodeWithFont[FontFamilyPlugin.key],
          );
        },
      })) {
        const nodeWithFont = node as { text: string; [key: string]: unknown };
        if (nodeWithFont[FontFamilyPlugin.key]) {
          const nodeFontFamily = nodeWithFont[FontFamilyPlugin.key] as string;
          fontFamilies.add(nodeFontFamily);
        }
      }
    } catch (error) {
      console.error("Error scanning editor for fonts:", error);
    }

    // Convert Set to array and update state
    const fontsArray = Array.from(fontFamilies);
    if (fontsArray.length > 0) {
      console.log("Found fonts to load:", fontsArray);
      setLoadedFonts(fontsArray);
    }
  }, [editor]);

  // Only render the FontPicker if we have fonts to load
  if (loadedFonts.length === 0) return null;

  return (
    <div style={{ display: "none" }}>
      <FontPicker
        defaultValue={loadedFonts[0]}
        loadFonts={loadedFonts}
        loaderOnly
      />
    </div>
  );
};
