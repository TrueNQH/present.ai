import { useRef } from "react";
import { useDrop } from "react-dnd";
import { cn } from "@udecode/cn";
import { DRAG_ITEM_BLOCK } from "@udecode/plate-dnd";
import { type PlateEditor, useEditorRef } from "@udecode/plate-core/react";
import { findNode, removeNodes, type TElement } from "@udecode/plate-common";
import { usePresentationState } from "@/states/presentation-state";
import { ImagePlugin } from "@udecode/plate-media/react";
import { type LayoutType } from "@/components/presentation/utils/parser";

function removeNodeById(editor: PlateEditor, id: string) {
  const nodeWithPath = findNode(editor, {
    match: {
      id,
    },
  });

  if (!nodeWithPath) return;
  const [element, path] = nodeWithPath;
  removeNodes(editor, { at: path });
  return element;
}

export default function LayoutImageDrop({
  slideIndex,
}: {
  slideIndex: number;
}) {
  // Create drop zones for top, left, and right
  const topRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const editor = useEditorRef();

  const handleImageDrop = (
    item: { element: TElement },
    layoutType: LayoutType
  ) => {
    // Only handle image elements
    if (item?.element?.type !== ImagePlugin.key) return;

    // Store the image URL and query
    let imageUrl = item.element.url as string;
    let imageQuery = item.element.query as string;

    // Check if the image is from the editor and needs to be removed
    const id = item.element.id as string;
    const element = removeNodeById(editor, id);
    if (element?.url) imageUrl = element.url as string;
    if (element?.query) imageQuery = element.query as string;

    // Get the current slides state
    const { slides, setSlides } = usePresentationState.getState();

    // Update the slides array with the new root image and layout type
    const updatedSlides = slides.map((slide, index) => {
      if (index === slideIndex) {
        return {
          ...slide,
          rootImage: {
            url: imageUrl,
            query: imageQuery,
          },
          layoutType: layoutType,
        };
      }
      return slide;
    });

    // Update the slides state
    setSlides(updatedSlides);
  };

  // Setup drop zones
  const [{ isTopOver }, dropTop] = useDrop({
    accept: [DRAG_ITEM_BLOCK],
    canDrop: (item: { element: TElement }) =>
      item.element.type === ImagePlugin.key,
    drop: (item) => {
      handleImageDrop(item, "vertical");
      return { droppedInLayoutZone: true }; // Add this return value
    },
    collect: (monitor) => ({
      isTopOver: monitor.isOver() && monitor.canDrop(),
    }),
  });

  const [{ isLeftOver }, dropLeft] = useDrop({
    accept: [DRAG_ITEM_BLOCK],
    canDrop: (item: { element: TElement }) =>
      item?.element?.type === ImagePlugin.key,
    drop: (item) => {
      handleImageDrop(item, "left");
      return { droppedInLayoutZone: true }; // Add this return value
    },
    collect: (monitor) => ({
      isLeftOver: monitor.isOver() && monitor.canDrop(),
    }),
  });

  const [{ isRightOver }, dropRight] = useDrop({
    accept: [DRAG_ITEM_BLOCK],
    canDrop: (item: { element: TElement }) =>
      item.element.type === ImagePlugin.key,
    drop: (item) => {
      handleImageDrop(item, "right");
      return { droppedInLayoutZone: true }; // Add this return value
    },
    collect: (monitor) => ({
      isRightOver: monitor.isOver() && monitor.canDrop(),
    }),
  });
  // Connect the drop refs
  dropTop(topRef);
  dropLeft(leftRef);
  dropRight(rightRef);

  return (
    <>
      {/* Top drop zone */}
      <div
        ref={topRef}
        className={cn(
          "absolute left-0 right-0 top-0 z-50 h-16",
          isTopOver ? "bg-primary/20" : "bg-transparent",
          "transition-colors duration-200"
        )}
      />

      {/* Left drop zone */}
      <div
        ref={leftRef}
        className={cn(
          "absolute bottom-0 left-0 top-16 z-50 w-8",
          isLeftOver ? "bg-primary/20" : "bg-transparent",
          "transition-colors duration-200"
        )}
      />

      {/* Right drop zone */}
      <div
        ref={rightRef}
        className={cn(
          "absolute bottom-0 right-0 top-16 z-50 w-8",
          isRightOver ? "bg-primary/20" : "bg-transparent",
          "transition-colors duration-200"
        )}
      />
    </>
  );
}
