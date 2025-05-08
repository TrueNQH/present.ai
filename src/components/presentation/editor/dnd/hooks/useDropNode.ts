/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrop,
} from "react-dnd";

import type { TNodeEntry, TElement } from "@udecode/plate";
import type { PlateEditor } from "@udecode/plate/react";

import type {
  DragItemNode,
  ElementDragItemNode,
  FileDragItemNode,
} from "@udecode/plate-dnd";

import { DndPlugin } from "@udecode/plate-dnd";
import { getDropPath, onDropNode } from "../transforms/onDropNode";
import { onHoverNode } from "../transforms/onHoverNode";

export type CanDropCallback = (args: {
  dragEntry: TNodeEntry<TElement>;
  dragItem: DragItemNode;
  dropEntry: TNodeEntry<TElement>;
  editor: PlateEditor;
}) => boolean;

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /** The node to which the drop line is attached. */
  element: TElement;

  /** The reference to the node being dragged. */
  nodeRef: React.RefObject<HTMLElement>;

  /**
   * Intercepts the drop handling. If `false` is returned, the default drop
   * behavior is called after. If `true` is returned, the default behavior is
   * not called.
   */
  canDropNode?: CanDropCallback;

  orientation?: "horizontal" | "vertical";

  onDropHandler?: (
    editor: PlateEditor,
    props: {
      id: string;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    },
  ) => boolean | void;
}

/**
 * `useDrop` hook to drop a node on the editor.
 *
 * On drop:
 *
 * - Get hover direction (top, bottom or undefined), return early if undefined
 * - DragPath: find node with id = dragItem.id, return early if not found
 * - Focus editor
 * - DropPath: find node with id = id, its path should be next (bottom) or
 *   previous (top)
 * - Move node from dragPath to dropPath
 *
 * On hover:
 *
 * - Get drop line direction
 * - If differs from dropLine, setDropLine is called
 *
 * Collect:
 *
 * - IsOver: true if mouse is over the block
 */
export const useDropNode = (
  editor: PlateEditor,
  {
    canDropNode,
    element,
    nodeRef,
    onDropHandler,
    ...options
  }: UseDropNodeOptions,
) => {
  const id = element.id as string;

  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    collect: (monitor) => ({
      isOver: monitor.isOver({
        shallow: true,
      }),
    }),
    drop: (dragItem, monitor) => {
      // Don't call onDropNode if this is a file drop

      if (!(dragItem as ElementDragItemNode).id) {
        const result = getDropPath(editor, {
          canDropNode,
          dragItem,
          element,
          monitor,
          nodeRef,
        });

        const onDropFiles = editor.getOptions(DndPlugin).onDropFiles;

        if (!result || !onDropFiles) return;

        return onDropFiles({
          id,
          dragItem: dragItem as FileDragItemNode,
          editor,
          monitor,
          nodeRef,
          target: result.to,
        });
      }

      const handled =
        !!onDropHandler &&
        onDropHandler(editor, {
          id,
          dragItem,
          monitor,
          nodeRef,
        });

      if (handled) return;

      onDropNode(editor, {
        canDropNode,
        dragItem: dragItem as ElementDragItemNode,
        element,
        monitor,
        nodeRef,
      });
    },
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        canDropNode,
        dragItem: item,
        element,
        monitor,
        nodeRef,
      });
    },
    ...options,
  });
};
