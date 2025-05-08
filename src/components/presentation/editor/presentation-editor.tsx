"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { cn, withProps } from "@udecode/cn";
import { type Value } from "@udecode/plate-common";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
} from "@udecode/plate-basic-marks/react";
import {
  createPlateEditor,
  ParagraphPlugin,
  Plate,
} from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ImagePlugin } from "@udecode/plate-media/react";
import { Editor } from "@/components/text-editor/plate-ui/editor";
import { withPlaceholders } from "@/components/text-editor/plate-ui/placeholder";
import debounce from "lodash.debounce";
import { FloatingToolbar } from "@/components/text-editor/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "@/components/text-editor/plate-ui/floating-toolbar-buttons";

import { presentationPlugins } from "./plugins";
import { TooltipProvider } from "@/components/ui/tooltip";
import { basicNodesPlugins } from "@/components/text-editor/plugins/basic-nodes-plugins";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { BlockSelection } from "@/components/text-editor/plate-ui/block-selection";
import {
  PresentationHeadingElement,
  PresentationParagraphElement,
  PresentationImageElement,
} from "./native-elements/index";
import { ColumnGroupElement } from "@/components/text-editor/plate-ui/column-group-element";
import { BlockquoteElement } from "@/components/text-editor/plate-ui/blockquote-element";
import { ColumnElement } from "@/components/text-editor/plate-ui/column-element";
import { PresentationLeafElement } from "./native-elements/presentation-leaf-element";
import { type PlateSlide } from "../utils/parser";
import RootImage from "./native-elements/root-image";
import LayoutImageDrop from "./dnd/components/LayoutImageDrop";
import { SlashInputPlugin } from "@udecode/plate-slash-command/react";
import { SlashInputElement } from "@/components/text-editor/plate-ui/slash-input-element";
import ImageGenerationModel from "@/components/text-editor/plate-ui/image-generation-model";
import { FontLoader } from "@/components/text-editor/plate-ui/font-loader";
import "@/app/presentation.css";

import "@/components/ui/font-picker.css";
import "react-fontpicker-ts/dist/index.css";
import { usePresentationState } from "@/states/presentation-state";
const createEditor = () => {
  const editor = createPlateEditor({
    plugins: [...basicNodesPlugins, ...presentationPlugins],
    override: {
      components: withPlaceholders({
        [ParagraphPlugin.key]: withProps(PresentationParagraphElement, {}),
        [HEADING_KEYS.h1]: withProps(PresentationHeadingElement, {
          as: "h1",
        }),
        [HEADING_KEYS.h2]: withProps(PresentationHeadingElement, {
          as: "h2",
        }),
        [HEADING_KEYS.h3]: withProps(PresentationHeadingElement, {
          as: "h3",
        }),
        [HEADING_KEYS.h4]: withProps(PresentationHeadingElement, {
          as: "h4",
        }),
        [HEADING_KEYS.h5]: withProps(PresentationHeadingElement, {
          as: "h5",
        }),
        [HEADING_KEYS.h6]: withProps(PresentationHeadingElement, {
          as: "h6",
        }),
        [ImagePlugin.key]: withProps(PresentationImageElement, {
          className: "align-middle",
        }),
        [ColumnPlugin.key]: withProps(ColumnGroupElement, {
          className: "flex flex-row gap-4 w-full [&_>_div]:w-full",
        }),
        [ColumnItemPlugin.key]: withProps(ColumnElement, {
          className: "flex-1 flex-row size-full gap-4",
        }),
        [BlockquotePlugin.key]: withProps(BlockquoteElement, {
          className: "pl-4 border-l-2 italic",
        }),
        [BlockSelectionPlugin.key]: BlockSelection,
        [BoldPlugin.key]: withProps(PresentationLeafElement, {}),
        [ItalicPlugin.key]: withProps(PresentationLeafElement, {}),
        [UnderlinePlugin.key]: withProps(PresentationLeafElement, {}),
        [StrikethroughPlugin.key]: withProps(PresentationLeafElement, {}),
        [SlashInputPlugin.key]: SlashInputElement,
      }),
    },
  });

  return editor;
};

export type PresentationEditor = ReturnType<typeof createEditor>;

interface PresentationEditorProps {
  initialContent?: PlateSlide;
  onChange?: (value: Value, index: number) => void;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  slideIndex: number;
  isGenerating: boolean;
  readOnly?: boolean;
  isPreview?: boolean;
}
// Use React.memo with a custom comparison function to prevent unnecessary re-renders
const PresentationEditor = React.memo(
  ({
    initialContent,
    onChange,
    className,
    id,
    autoFocus = true,
    slideIndex,
    isGenerating = false,
    readOnly = false,
    isPreview = false,
  }: PresentationEditorProps) => {
    const { isPresenting } = usePresentationState();
    // Create a unique editor instance
    const editor = useMemo(() => createEditor(), []);

    useEffect(() => {
      if (initialContent) {
        setTimeout(() => {
          editor.tf.setValue(initialContent.content);
        }, 0);
      }
    }, []);

    useEffect(() => {
      if (isGenerating) {
        setTimeout(() => {
          editor.tf.setValue(initialContent?.content);
        }, 0);
      }
    }, [initialContent, isGenerating]);

    const debouncedOnChange = useRef(
      debounce(
        (value: Value, index: number) => {
          onChange?.(value, index);
        },
        100,
        { maxWait: 200 }
      )
    ).current;

    // Cleanup debounce on unmount
    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);

    return (
      <TooltipProvider>
        <div
          className={cn(
            "flex min-h-[500px]",
            "scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 overflow-hidden p-0 scrollbar-w-1 scrollbar-track-transparent",
            "relative text-foreground",
            "focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50",
            className,
            initialContent?.layoutType === "right" && "flex-row",
            initialContent?.layoutType === "vertical" && "flex-col-reverse",
            initialContent?.layoutType === "left" && "flex-row-reverse",
            "presentation-slide"
          )}
          style={{
            borderRadius: "var(--presentation-border-radius, 0.5rem)",
          }}
          data-is-presenting={readOnly ? "true" : "false"}
          data-slide-content="true"
        >
          <FontLoader editor={editor} />

          <Plate
            editor={editor}
            onValueChange={({ value }) => {
              if (readOnly || isGenerating || isPresenting) return;

              debouncedOnChange(value, slideIndex);
            }}
            readOnly={isGenerating || readOnly}
          >
            {!readOnly && (
              <LayoutImageDrop slideIndex={slideIndex}></LayoutImageDrop>
            )}
            <Editor
              className={cn(
                className,
                "flex flex-col border-none !bg-transparent py-12 outline-none",
                initialContent?.alignment === "start" && "justify-start",
                initialContent?.alignment === "center" && "justify-center",
                initialContent?.alignment === "end" && "justify-end"
              )}
              id={id}
              autoFocus={autoFocus && !readOnly}
              variant="ghost"
              size="md"
              readOnly={isPreview || isGenerating || readOnly}
            />

            {!readOnly && (
              <FloatingToolbar>
                <FloatingToolbarButtons />
              </FloatingToolbar>
            )}

            {initialContent?.rootImage &&
              initialContent.layoutType !== undefined && (
                <RootImage
                  image={initialContent.rootImage}
                  slideIndex={slideIndex}
                  layoutType={initialContent.layoutType}
                  shouldGenerate={!isPreview}
                />
              )}
            {!readOnly && <ImageGenerationModel></ImageGenerationModel>}
          </Plate>
        </div>
      </TooltipProvider>
    );
  }
);

PresentationEditor.displayName = "PresentationEditor";

export default PresentationEditor;
