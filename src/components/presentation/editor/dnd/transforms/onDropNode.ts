import { findPath, type PlateEditor } from "@udecode/plate/react";
import type { DropTargetMonitor } from "react-dnd";

import {
  moveNodes,
  insertNodes,
  type TNodeEntry,
  type TElement,
} from "@udecode/plate";
import type { UseDropNodeOptions } from "../hooks";
import type { DragItemNode, ElementDragItemNode } from "@udecode/plate-dnd";
import { Path } from "slate";
import { getHoverDirection } from "../utils";
import { insertColumnGroup } from "@udecode/plate-layout";

/** Callback called on drag and drop a node with id. */
export const getDropPath = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    "canDropNode" | "element" | "nodeRef" | "orientation"
  >,
) => {
  const direction = getHoverDirection({
    dragItem,
    element,
    monitor,
    nodeRef,
  });

  if (!direction) return;

  let dragEntry: TNodeEntry<TElement> | undefined;
  let dropEntry: TNodeEntry<TElement> | undefined;

  if ("element" in dragItem) {
    const dragPath = findPath(editor, dragItem.element as TElement);
    const hoveredPath = findPath(editor, element);

    if (!hoveredPath) return;

    // If dragPath is found, we're moving an existing node
    // If not, we're inserting a new node (e.g., from root image)
    if (dragPath) {
      dragEntry = [dragItem.element as TElement, dragPath];
    }

    dropEntry = [element, hoveredPath];
  } else {
    return;
  }

  if (!dropEntry) return;

  // Only check canDropNode if we have a dragEntry (for existing nodes)
  if (
    canDropNode &&
    dragEntry &&
    !canDropNode({ dragEntry, dragItem, dropEntry, editor })
  ) {
    return;
  }

  let dropPath: Path | undefined;

  // if drag from file system use [] as default path
  const dragPath = dragEntry?.[1];
  const hoveredPath = dropEntry[1];

  // For left/right direction, we'll return early since we'll handle it differently
  if (direction === "left" || direction === "right") {
    // Include isExternalNode flag if dragPath is not available
    return { direction, dragPath, hoveredPath, isExternalNode: !dragPath };
  }

  // Handle top/bottom drops
  if (dragPath && direction === "bottom") {
    // Insert after hovered node
    dropPath = hoveredPath;

    // If the dragged node is already right after hovered node, no change
    if (Path.equals(dragPath, Path.next(dropPath))) return;
  } else if (direction === "bottom") {
    // For external nodes (no dragPath)
    dropPath = hoveredPath;
  }

  if (dragPath && direction === "top") {
    // Insert before hovered node
    dropPath = [...hoveredPath.slice(0, -1), hoveredPath.at(-1)! - 1];

    // If the dragged node is already right before hovered node, no change
    if (Path.equals(dragPath, dropPath)) return;
  } else if (direction === "top") {
    // For external nodes (no dragPath)
    dropPath = [...hoveredPath.slice(0, -1), hoveredPath.at(-1)! - 1];
  }

  if (!dropPath) return;

  const before =
    dragPath &&
    Path.isBefore(dragPath, dropPath) &&
    Path.isSibling(dragPath, dropPath);
  const to = before ? dropPath : Path.next(dropPath);

  // Include isExternalNode flag if dragPath is not available
  return { direction, dragPath, to, isExternalNode: !dragPath };
};

export const onDropNode = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
  }: {
    dragItem: ElementDragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<UseDropNodeOptions, "canDropNode" | "element" | "nodeRef">,
) => {
  const result = getDropPath(editor, {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
  });

  if (!result) return;

  const { direction, dragPath, to, hoveredPath, isExternalNode } = result;

  // External node (like root image)
  if (
    isExternalNode &&
    dragItem.element &&
    typeof dragItem.element === "object"
  ) {
    if (direction === "left" || direction === "right") {
      if (!hoveredPath) return;

      // Create a column group with empty columns
      insertColumnGroup(editor, {
        columns: 2,
        at: hoveredPath,
      });

      // Get the paths of the two column items that were just created
      const columnGroupPath = hoveredPath;
      const firstColumnPath = [...columnGroupPath, 0];
      const secondColumnPath = [...columnGroupPath, 1];

      // Move the target element into the first column
      moveNodes(editor, {
        at: Path.next(hoveredPath), // Use next because insertColumnGroup pushes the target down
        to: [...firstColumnPath, 0],
      });

      // Insert the dragged element into the second column
      insertNodes(editor, dragItem.element as TElement, {
        at: [...secondColumnPath, 0],
      });

      return;
    }

    // Handle top/bottom drops for external nodes
    if (to) {
      insertNodes(editor, dragItem.element as TElement, {
        at: to,
      });
      return;
    }
  }

  // Handle left/right drops by creating columns (for existing nodes)
  if (direction === "left" || direction === "right") {
    if (!dragPath || !hoveredPath) return;

    // Create a column group with empty columns
    insertColumnGroup(editor, {
      columns: 2,
      at: hoveredPath,
    });

    // Get the paths of the two column items that were just created
    const columnGroupPath = hoveredPath;
    const firstColumnPath = [...columnGroupPath, 0];
    const secondColumnPath = [...columnGroupPath, 1];

    // Move the target element into the first column
    moveNodes(editor, {
      at: Path.next(hoveredPath), // Use next because insertColumnGroup pushes the target down
      to: [...firstColumnPath, 0],
    });

    // Move the dragged element into the second column
    moveNodes(editor, {
      at: dragPath,
      to: [...secondColumnPath, 0],
    });

    return;
  }

  // Handle top/bottom drops (for existing nodes)
  if (!dragPath || !to) return;

  // Standard node move
  moveNodes(editor, {
    at: dragPath,
    to,
  });
};
