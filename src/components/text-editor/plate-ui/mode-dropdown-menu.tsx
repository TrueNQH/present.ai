/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import {
  focusEditor,
  useEditorReadOnly,
  useEditorRef,
  usePlateStore,
} from "@udecode/plate-common/react";

import { Icons } from "@/components/text-editor/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function ModeDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const setReadOnly = usePlateStore().set.readOnly();
  const readOnly = useEditorReadOnly();
  const openState = useOpenState();

  let value = "editing";

  if (readOnly) value = "viewing";

  const item: any = {
    editing: (
      <>
        <Icons.editing className="mr-2 size-5" />
      </>
    ),
    viewing: (
      <>
        <Icons.viewing className="mr-2 size-5" />
      </>
    ),
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="min-w-[auto]"
          pressed={openState.open}
          tooltip="Editing mode"
          isDropdown
        >
          {item[value]}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[180px]" align="start">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(newValue) => {
            if (newValue !== "viewing") {
              setReadOnly(false);
            }
            if (newValue === "viewing") {
              setReadOnly(true);

              return;
            }
            if (newValue === "editing") {
              focusEditor(editor);

              return;
            }
          }}
        >
          <DropdownMenuRadioItem value="editing">
            {item.editing}
            Editing
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="viewing">
            {item.viewing}
            Viewing
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
