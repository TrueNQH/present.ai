"use client";

import React from "react";

import { cn, withRef } from "@udecode/cn";
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from "@udecode/plate-floating";
import {
  useComposedRef,
  useEditorId,
  useEditorPlugin,
  useEventEditorSelectors,
} from "@udecode/plate-common/react";

import { Toolbar } from "./toolbar";
import { AIChatPlugin } from "@udecode/plate-ai/react";

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorSelectors.focus();
  const { useOption } = useEditorPlugin({ key: "a" });
  const isFloatingLinkOpen = useOption("mode");
  const { useOption: useAiChatOption } = useEditorPlugin(AIChatPlugin);
  const isAIChatOpen = useAiChatOption("open");

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen ?? isAIChatOpen,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            "top-start",
            "top-end",
            "bottom-start",
            "bottom-end",
          ],
          padding: 12,
        }),
      ],
      placement: "top",
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        ref={ref}
        className={cn(
          "absolute z-50 overflow-x-auto whitespace-nowrap rounded-md border bg-popover opacity-100 shadow-md scrollbar-hide print:hidden",
          "max-w-[80vw]"
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
});
