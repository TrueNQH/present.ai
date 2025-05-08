"use client";

import React from "react";

import { cn } from "@udecode/cn";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import {
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
  useEditorRef,
} from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { FontSizePlugin } from "@udecode/plate-font/react";

export const Placeholder = (props: PlaceholderProps) => {
  const { children, nodeProps, placeholder, style: defaultStyle } = props;
  const { enabled } = usePlaceholderState(props);
  const editor = useEditorRef();

  const style = React.useMemo(() => {
    if (!enabled) return {};
    const marks = editor?.getMarks?.();
    return marks?.[FontSizePlugin.key as string]
      ? { fontSize: marks[FontSizePlugin.key as string] }
      : {};
  }, [enabled, editor]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return React.Children.map(children, (child) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return React.cloneElement(child, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        style: { ...defaultStyle, ...style },
        className: cn(
          enabled &&
            "before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]",
        ),
        placeholder,
      },
    });
  });
};

Placeholder.displayName = "Placeholder";

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withPlaceholders = (components: any) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  withPlaceholdersPrimitive(components, [
    {
      key: ParagraphPlugin.key,
      hideOnBlur: true,
      placeholder: "Type a paragraph",
      query: {
        maxLevel: 1,
      },
    },
    {
      key: HEADING_KEYS.h1,
      hideOnBlur: false,
      placeholder: "Untitled",
    },
  ]);
