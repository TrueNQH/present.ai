/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { getEmptyImage, NativeTypes } from "react-dnd-html5-backend";

import type {
  ConnectableElement,
  ConnectDragSource,
  DropTargetMonitor,
} from "react-dnd";

import { type PlateEditor, useEditorRef } from "@udecode/plate/react";

import type { DragItemNode } from "@udecode/plate-dnd";
import { DndPlugin, DRAG_ITEM_BLOCK } from "@udecode/plate-dnd";
import { type UseDragNodeOptions, useDragNode } from "./useDragNode";
import { type UseDropNodeOptions, useDropNode } from "./useDropNode";

export type UseDndNodeOptions = Pick<UseDropNodeOptions, "element"> &
  Partial<Pick<UseDropNodeOptions, "canDropNode" | "nodeRef">> &
  Partial<Pick<UseDragNodeOptions, "type">> & {
    /** Options passed to the drag hook. */
    drag?: Partial<Omit<UseDragNodeOptions, "type">>;
    /** Options passed to the drop hook, excluding element, nodeRef. */
    drop?: Partial<
      Omit<UseDropNodeOptions, "canDropNode" | "element" | "nodeRef">
    >;
    preview?: {
      /** Whether to disable the preview. */
      disable?: boolean;
      /** The reference to the preview element. */
      ref?: ConnectableElement;
    };
    onDropHandler?: (
      editor: PlateEditor,
      props: {
        id: string;
        dragItem: DragItemNode;
        monitor: DropTargetMonitor<DragItemNode, unknown>;
        nodeRef: React.RefObject<HTMLElement>;
      },
    ) => boolean | void;
  };

/**
 * {@link useDragNode} and {@link useDropNode} hooks to drag and drop a node from
 * the editor. A default preview is used to show the node being dragged, which
 * can be customized or removed. Returns the drag ref and drop line direction.
 */
export const useDndNode = ({
  canDropNode,
  drag: dragOptions,
  drop: dropOptions,
  element,
  nodeRef,
  preview: previewOptions = {},
  type = DRAG_ITEM_BLOCK,
  onDropHandler,
}: UseDndNodeOptions): {
  dragRef: ConnectDragSource;
  isDragging: boolean;
  isOver: boolean;
} => {
  const editor = useEditorRef();

  const [{ isDragging }, dragRef, preview] = useDragNode(editor, {
    element,
    type,
    ...dragOptions,
  });

  const [{ isOver }, drop] = useDropNode(editor, {
    accept: [type, NativeTypes.FILE],
    canDropNode,
    element,
    nodeRef: nodeRef!,
    onDropHandler,
    ...dropOptions,
  });

  if (previewOptions.disable) {
    drop(nodeRef!);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewOptions.ref) {
    drop(nodeRef!);
    preview(previewOptions.ref);
  } else {
    preview(drop(nodeRef!));
  }

  useEffect(() => {
    if (!isOver && editor.getOptions(DndPlugin).dropTarget?.id) {
      editor.setOption(DndPlugin, "dropTarget", { id: null, line: "" });
    }
  }, [isOver, editor]);

  return {
    dragRef,
    isDragging,
    isOver,
  };
};
