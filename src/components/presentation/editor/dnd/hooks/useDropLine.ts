import { useEditorPlugin, useElement } from "@udecode/plate/react";

import { DndPlugin, type DropLineDirection } from "@udecode/plate-dnd";

export const useDropLine = ({
  id: idProp,
}: {
  /** The id of the element to show the dropline for. */
  id?: string;
} = {}): {
  dropLine?: DropLineDirection;
} => {
  const element = useElement();
  const id = idProp ?? (element.id as string);

  const { useOption } = useEditorPlugin(DndPlugin);

  const dropLine = useOption("dropTarget");
  if (!dropLine) return { dropLine: "" };
  if (dropLine.id !== id) return { dropLine: "" };
  return {
    dropLine: dropLine.line,
  };
};
