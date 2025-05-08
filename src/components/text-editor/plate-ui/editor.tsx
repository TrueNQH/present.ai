import type { PlateContentProps } from "@udecode/plate-common/react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@udecode/cn";
import {
  PlateContent,
  useEditorContainerRef,
  useEditorRef,
} from "@udecode/plate-common/react";
import { cva } from "class-variance-authority";
import React from "react";

const editorVariants = cva(
  cn(
    "group/editor relative overflow-x-auto whitespace-pre-wrap break-words",
    "min-h-[80px] w-full rounded-md bg-background px-6 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
    "[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100",
    "[&_[data-slate-placeholder]]:top-[auto_!important]",
    "[&_strong]:font-bold",
  ),
  {
    defaultVariants: {
      focusRing: true,
      size: "sm",
      variant: "outline",
    },
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },

      focusRing: {
        false: "",
        true: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      },
      focused: {
        true: "ring-2 ring-ring ring-offset-2",
        false: "",
      },
      size: {
        md: "text-base",
        sm: "text-sm",
      },
      variant: {
        ghost: "",
        outline: "border border-input",
        aiChat:
          "max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm",
      },
    },
  },
);
const editorContainerVariants = cva(
  "relative w-full min-h-full cursor-text caret-primary selection:bg-primary/25 focus-visible:outline-none [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary/25 [&_.slate-selection-area]:bg-primary/15",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "h-max",
        select: cn(
          "group rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "has-[[data-readonly]]:w-fit has-[[data-readonly]]:cursor-default has-[[data-readonly]]:border-transparent has-[[data-readonly]]:focus-within:[box-shadow:none]",
        ),
      },
    },
  },
);
export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

export const EditorContainer = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof editorContainerVariants>) => {
  const editor = useEditorRef();
  const containerRef = useEditorContainerRef();
  return (
    <div
      id={editor.uid}
      ref={containerRef}
      className={cn(
        // "ignore-click-outside/toolbar",
        editorContainerVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
};
EditorContainer.displayName = "EditorContainer";

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, focused, variant, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          editorVariants({
            disabled,
            focused,
            variant,
            focusRing: false,
          }),
          className,
        )}
        disabled={disabled}
        disableDefaultStyles
        {...props}
      />
    );
  },
);
Editor.displayName = "Editor";
