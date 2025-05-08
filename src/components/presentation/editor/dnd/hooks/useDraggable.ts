/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { useEditorRef } from "@udecode/plate/react";

import { DRAG_ITEM_BLOCK } from "@udecode/plate-dnd";
import { useDndNode, type UseDndNodeOptions } from "./useDndNode";
import { type ConnectDragSource } from "react-dnd";
export type DraggableState = {
  isDragging: boolean;
  /** The ref of the draggable element */
  previewRef: React.RefObject<HTMLDivElement | null>;
  /** The ref of the draggable handle */
  handleRef: (
    elementOrNode:
      | Element
      | React.ReactElement<any>
      | React.RefObject<any>
      | null,
  ) => void;
};

export const useDraggable = (props: UseDndNodeOptions): DraggableState => {
  const { type = DRAG_ITEM_BLOCK, onDropHandler } = props;

  const editor = useEditorRef();

  const nodeRef = React.useRef<HTMLDivElement>(null);

  if (!editor.plugins.dnd)
    return {
      isDragging: false,
      previewRef: nodeRef,
      handleRef: nodeRef as unknown as ConnectDragSource,
    };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { dragRef, isDragging } = useDndNode({
    nodeRef,
    type,
    onDropHandler,
    ...props,
  });

  return {
    isDragging,
    previewRef: nodeRef,
    handleRef: dragRef,
  };
};
