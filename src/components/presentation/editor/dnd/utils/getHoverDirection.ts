import type { TElement } from "@udecode/plate";
import type { DropTargetMonitor } from "react-dnd";

import type {
  DragItemNode,
  DropDirection,
  ElementDragItemNode,
} from "@udecode/plate-dnd";

export interface GetHoverDirectionOptions {
  dragItem: DragItemNode;

  /** Hovering node. */
  element: TElement;

  monitor: DropTargetMonitor;

  /** The node ref of the node being dragged. */
  nodeRef: React.RefObject<HTMLElement>;
}

/**
 * If dragging a node A over another node B: get the direction of node A
 * relative to node B based on mouse position and proximity to edges.
 */
export const getHoverDirection = ({
  dragItem,
  element,
  monitor,
  nodeRef,
}: GetHoverDirectionOptions): DropDirection => {
  if (!nodeRef.current) return;
  // Don't replace items with themselves
  if (element === (dragItem as ElementDragItemNode).element) return;

  // Determine rectangle on screen
  const hoverBoundingRect = nodeRef.current?.getBoundingClientRect();

  if (!hoverBoundingRect) {
    return;
  }

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();

  if (!clientOffset) {
    return;
  }

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  // Get horizontal middle
  const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

  // Get pixels to the top and left
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;
  const hoverClientX = clientOffset.x - hoverBoundingRect.left;

  // Calculate distances from the mouse to the center
  const distanceFromCenterY = Math.abs(hoverClientY - hoverMiddleY);
  const distanceFromCenterX = Math.abs(hoverClientX - hoverMiddleX);

  // If we're closer to the top/bottom edges than the left/right edges
  if (
    distanceFromCenterY / hoverBoundingRect.height >
    distanceFromCenterX / hoverBoundingRect.width
  ) {
    // Vertical direction takes precedence
    return hoverClientY < hoverMiddleY ? "top" : "bottom";
  } else {
    // Horizontal direction takes precedence
    return hoverClientX < hoverMiddleX ? "left" : "right";
  }
};
