/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import {
  collapseSelection,
  getNodeEntries,
  isBlock,
} from "@udecode/plate-common";
import {
  ParagraphPlugin,
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";

import { Icons } from "@/components/text-editor/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";
import { toggleIndentList } from "@udecode/plate-indent-list";
import { unwrapList } from "@udecode/plate-list";
import { INDENT_LIST_KEYS } from "@udecode/plate-indent-list";
import { Columns3Icon } from "lucide-react";
import { ColumnPlugin } from "@udecode/plate-layout/react";
import { toggleColumnGroup } from "@udecode/plate-layout";
const items = [
  {
    description: "Paragraph",
    icon: Icons.paragraph,
    label: "Paragraph",
    value: ParagraphPlugin.key,
  },
  {
    description: "Heading 1",
    icon: Icons.h1,
    label: "Heading 1",
    value: HEADING_KEYS.h1,
  },
  {
    description: "Heading 2",
    icon: Icons.h2,
    label: "Heading 2",
    value: HEADING_KEYS.h2,
  },
  {
    description: "Heading 3",
    icon: Icons.h3,
    label: "Heading 3",
    value: HEADING_KEYS.h3,
  },
  {
    description: "Quote (⌘+⇧+.)",
    icon: Icons.blockquote,
    label: "Quote",
    value: BlockquotePlugin.key,
  },
  {
    value: "ul",
    label: "Bulleted list",
    description: "Bulleted list",
    icon: Icons.ul,
  },
  {
    value: "ol",
    label: "Numbered list",
    description: "Numbered list",
    icon: Icons.ol,
  },
  {
    icon: Columns3Icon,
    label: "3 columns",
    value: ColumnPlugin.key,
  },
  {
    value: INDENT_LIST_KEYS.todo,
    label: "Todo list",
    description: "Todo list",
    icon: Icons.todo,
  },
];

const defaultItem = items.find((item) => item.value === ParagraphPlugin.key)!;

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const value: string = useEditorSelector((editor) => {
    let initialNodeType: string = ParagraphPlugin.key;
    let allNodesMatchInitialNodeType = false;
    const codeBlockEntries = getNodeEntries(editor, {
      match: (n) => isBlock(editor, n),
      mode: "highest",
    });
    const nodes = Array.from(codeBlockEntries);

    if (nodes.length > 0) {
      initialNodeType = nodes[0]![0].type as string;
      allNodesMatchInitialNodeType = nodes.every(([node]) => {
        const type: string = (node?.type as string) || ParagraphPlugin.key;

        return type === initialNodeType;
      });
    }

    return allNodesMatchInitialNodeType ? initialNodeType : ParagraphPlugin.key;
  }, []);

  const editor = useEditorRef();
  const openState = useOpenState();

  const selectedItem =
    items.find((item) => item.value === value) ?? defaultItem;
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="lg:min-w-[130px]"
          pressed={openState.open}
          tooltip="Turn into"
          isDropdown
        >
          <SelectedItemIcon className="size-5 lg:hidden" />
          <span className="max-lg:hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        align="start"
      >
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(type) => {
            if (
              type === "ul" ||
              type === "ol" ||
              type === INDENT_LIST_KEYS.todo
            ) {
              toggleIndentList(editor, {
                listStyleType:
                  type === "ul"
                    ? "disc"
                    : type === "ol"
                      ? "decimal"
                      : INDENT_LIST_KEYS.todo,
              });
            } else if (type === ColumnPlugin.key) {
              toggleColumnGroup(editor, {
                columns: 3,
              });
            } else {
              unwrapList(editor);
              editor.tf.toggle.block({ type });
            }
            collapseSelection(editor);
            focusEditor(editor);
          }}
        >
          {items.map(({ icon: Icon, label, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="min-w-[180px]"
              value={itemValue}
            >
              <Icon className="mr-2 size-5" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
