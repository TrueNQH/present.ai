import React from "react";
import { cn } from "@udecode/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./dropdown-menu";
import {
  useFontSizeDropdownMenuState,
  useFontSizeDropdownMenu,
} from "../hooks/use-fontsize-dropdown-menu-state";
import { DEFAULT_FONT_SIZES } from "./font-size-constants";
import { focusEditor, useEditorRef } from "@udecode/plate-common/react";

type FontSizeInputProps = {
  nodeType: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function FontSizeInput({
  nodeType,
  className,
  ...props
}: FontSizeInputProps) {
  const editor = useEditorRef();
  const state = useFontSizeDropdownMenuState({
    nodeType,
    closeOnSelect: true,
    sizes: DEFAULT_FONT_SIZES,
  });

  const { menuProps } = useFontSizeDropdownMenu(state);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [caretPosition, setCaretPosition] = React.useState<number | null>(null);

  const getFontSizeNumber = (value: string | undefined) => {
    if (!value) return 16;
    const num = parseInt(value.replace("px", ""));
    return isNaN(num) ? 16 : num;
  };

  const getDisplayValue = (value: string | undefined) => {
    return value ? value.replace("px", "") : "16";
  };

  const [inputValue, setInputValue] = React.useState(() =>
    getDisplayValue(state.fontSize),
  );

  // Modified to focus editor after update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d]/g, "");
    setInputValue(newValue);
    setCaretPosition(e.target.selectionStart);

    if (newValue && !isNaN(parseInt(newValue))) {
      state.updateFontSize(`${newValue}px`);
      // Focus editor after the state update
      setTimeout(() => focusEditor(editor), 0);
    }
  };

  // Modified to focus editor after update
  const handleStep = (step: number) => {
    const currentValue = getFontSizeNumber(state.fontSize);
    const newValue = Math.max(1, currentValue + step);
    setInputValue(newValue.toString());
    state.updateFontSize(`${newValue}px`);
    // Focus editor after the state update
    setTimeout(() => focusEditor(editor), 0);
  };

  const handleBlur = () => {
    if (!inputValue || isNaN(parseInt(inputValue))) {
      setInputValue("16");
      state.updateFontSize("16px");
      // Focus editor after the state update
      setTimeout(() => focusEditor(editor), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleStep(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleStep(-1);
    }
  };

  React.useEffect(() => {
    const newDisplayValue = getDisplayValue(state.fontSize);
    if (newDisplayValue !== inputValue) {
      setInputValue(newDisplayValue);
    }
  }, [state.fontSize]);

  React.useEffect(() => {
    if (caretPosition !== null && inputRef.current) {
      inputRef.current.selectionStart = caretPosition;
      inputRef.current.selectionEnd = caretPosition;
      setCaretPosition(null);
    }
  }, [caretPosition]);

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <div className="flex items-center rounded-md border bg-background">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          className="border-r px-2 py-1 text-sm hover:bg-muted"
        >
          -
        </button>
        <DropdownMenu modal={false} {...menuProps}>
          <DropdownMenuTrigger asChild>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onMouseDown={(e) => e.stopPropagation()} // Prevent focus loss
              className="w-12 bg-transparent px-2 py-1 text-center focus:outline-none"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="flex max-h-80 flex-col overflow-auto"
          >
            {DEFAULT_FONT_SIZES.map(({ name, value }) => (
              <DropdownMenuItem
                key={value}
                className="flex items-center justify-between px-3 py-1"
                onSelect={(e) => {
                  e.preventDefault();
                  setInputValue(name);
                  state.updateFontSizeAndClose(value);
                  // Focus editor after dropdown selection
                  setTimeout(() => focusEditor(editor), 0);
                }}
              >
                <span>{name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={() => handleStep(1)}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          className="border-l px-2 py-1 text-sm hover:bg-muted"
        >
          +
        </button>
      </div>
    </div>
  );
}
