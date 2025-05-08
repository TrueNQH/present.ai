import React from "react";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DEFAULT_COLORS } from "../text-editor/plate-ui/color-constants";

function ColorPicker({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const [customColor, setCustomColor] = React.useState(value);
  const [localColor, setLocalColor] = React.useState(value);

  // Create a debounced version of onChange
  const debouncedOnChange = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      debounce((color: string) => {
        onChange(color);
      }, 100), // 100ms delay
    [onChange]
  );

  React.useEffect(() => {
    setCustomColor(value);
    setLocalColor(value);
  }, [value]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleColorChange = (color: string) => {
    setLocalColor(color); // Update local state immediately for UI
    setCustomColor(color);
    debouncedOnChange(color); // Debounce the actual onChange call
  };

  return (
    <div id="color-picker">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children ?? (
            <Button
              variant="outline"
              className={cn("flex h-10 w-10 items-center justify-center p-0")}
              style={{ backgroundColor: localColor }}
              disabled={disabled}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          container={document.getElementById("color-picker") ?? undefined}
          align="start"
          className="h-96 overflow-y-auto p-3"
        >
          <div className="grid grid-cols-5 gap-2">
            <TooltipProvider>
              {DEFAULT_COLORS.map((color) => (
                <Tooltip key={color.value}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2",
                        localColor === color.value && "ring-2 ring-offset-2"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-medium">{color.name}</div>
                    <div className="text-muted-foreground">{color.value}</div>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Custom color picker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        handleColorChange(e.target.value);
                      }}
                      className="absolute h-8 w-8 cursor-pointer opacity-0"
                    />
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-dashed border-gray-300 bg-white",
                        "flex items-center justify-center transition-transform hover:scale-110"
                      )}
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="font-medium">Custom color</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ColorPicker;
