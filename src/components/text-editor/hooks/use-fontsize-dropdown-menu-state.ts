import React from "react";
import { getMark, select } from "@udecode/plate-common";
import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from "@udecode/plate-common/react";
import {
  BaseLineHeightPlugin,
  setLineHeight,
} from "@udecode/plate-line-height";
import { DEFAULT_FONT_SIZES } from "../plate-ui/font-size-constants";

export const useFontSizeDropdownMenuState = ({
  closeOnSelect = true,
  sizes = DEFAULT_FONT_SIZES,
  nodeType,
}: {
  sizes?: typeof DEFAULT_FONT_SIZES;
  nodeType: string;
  closeOnSelect?: boolean;
}) => {
  const editor = useEditorRef();
  const fontSize = useEditorSelector(
    (editor) => getMark(editor, nodeType) as string,
    [nodeType],
  );

  const [open, setOpen] = React.useState(false);

  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen],
  );

  const updateFontSize = React.useCallback(
    (value: string) => {
      if (!editor || !value) return;

      // If no selection, ensure we have one
      if (!editor.selection) {
        select(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
      }

      focusEditor(editor);

      // Use addMark instead of toggle.mark for value-based marks
      editor.addMark(nodeType, value);

      // Set line height using the plugin's method
      setLineHeight(editor, {
        value: 1,
      });
    },
    [editor, nodeType],
  );

  const updateFontSizeAndClose = React.useCallback(
    (value: string) => {
      updateFontSize(value);
      closeOnSelect && onToggle();
    },
    [closeOnSelect, onToggle, updateFontSize],
  );

  const clearFontSize = React.useCallback(() => {
    if (!editor || !editor.selection) return;

    focusEditor(editor);

    // Remove the mark directly
    editor.removeMark(nodeType);

    // Reset line height to default
    const { defaultNodeValue } = editor.getInjectProps(BaseLineHeightPlugin);
    setLineHeight(editor, {
      value: Number(defaultNodeValue),
    });

    closeOnSelect && onToggle();
  }, [editor, closeOnSelect, onToggle, nodeType]);

  // Track changes to selection and update fontSize state
  React.useEffect(() => {
    if (editor?.selection) {
      const currentFontSize = getMark(editor, nodeType) as string;
      if (currentFontSize !== fontSize) {
        editor.addMark(nodeType, fontSize);
      }
    }
  }, [editor?.selection, fontSize, nodeType]);

  return {
    clearFontSize,
    fontSize,
    sizes,
    open,
    updateFontSize,
    updateFontSizeAndClose,
    onToggle,
  };
};

export const useFontSizeDropdownMenu = ({
  open,
  onToggle,
  fontSize,
}: ReturnType<typeof useFontSizeDropdownMenuState>) => {
  return {
    buttonProps: {
      pressed: open,
      style: fontSize ? { fontSize } : undefined,
    },
    menuProps: {
      open,
      onOpenChange: onToggle,
    },
  };
};
