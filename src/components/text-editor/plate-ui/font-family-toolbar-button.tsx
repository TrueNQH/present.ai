"use client";

import React from "react";
import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from "@udecode/plate-common/react";
import { select, getMark } from "@udecode/plate-common";
import { FontFamilyPlugin } from "@udecode/plate-font/react";
import { FontPicker } from "@/components/ui/font-picker";
import { cn } from "@udecode/cn";

export function FontFamilyToolbarButton() {
  const editor = useEditorRef();

  // Get the current font family from the editor
  const fontFamily = useEditorSelector(
    (editor) => getMark(editor, FontFamilyPlugin.key) as string,
    [FontFamilyPlugin.key],
  );

  const handleFontChange = (font: string) => {
    if (!editor || !font) return;

    // If no selection, ensure we have one
    if (!editor.selection) {
      select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    }

    focusEditor(editor);

    // Set the font family mark
    editor.addMark(FontFamilyPlugin.key, font);
  };

  return (
    <div className={cn("flex h-full items-center")}>
      <FontPicker
        value={fontFamily}
        onChange={handleFontChange}
        autoLoad={true}
      />
    </div>
  );
}
