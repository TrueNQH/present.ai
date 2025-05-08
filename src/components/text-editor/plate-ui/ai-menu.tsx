"use client";

import * as React from "react";

import { AIChatPlugin, useEditorChat } from "@udecode/plate-ai/react";
import {
  type TElement,
  type TNodeEntry,
  getAncestorNode,
  getBlocks,
  isElementEmpty,
  isSelectionAtBlockEnd,
} from "@udecode/plate-common";
import {
  type PlateEditor,
  toDOMNode,
  useEditorPlugin,
  useHotkeys,
} from "@udecode/plate-common/react";
import {
  BlockSelectionPlugin,
  useIsSelecting,
} from "@udecode/plate-selection/react";
import { Loader2Icon } from "lucide-react";

import { AIChatEditor } from "./ai-chat-editor";
import { AIMenuItems } from "./ai-menu-items";
import { Command, CommandList, InputCommand } from "./command";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { useChat } from "../hooks/use-chat";

export function AIMenu() {
  const { api, editor, useOption } = useEditorPlugin(AIChatPlugin);
  const open = useOption("open");
  const mode = useOption("mode");
  const isSelecting = useIsSelecting();

  const aiEditorRef = React.useRef<PlateEditor | null>(null);
  const [, setValue] = React.useState("");

  const chat = useChat();

  const { input, isLoading, messages, setInput } = chat;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null,
  );

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: TNodeEntry[]) => {
      show(toDOMNode(editor, blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
        setInput("");
      }
    },
    onOpenCursor: () => {
      const ancestor = getAncestorNode(editor)?.[0] as TElement;

      if (!isSelectionAtBlockEnd(editor) && !isElementEmpty(editor, ancestor)) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.addSelectedRow(ancestor.id as string);
      }

      show(toDOMNode(editor, ancestor)!);
    },
    onOpenSelection: () => {
      show(toDOMNode(editor, getBlocks(editor).at(-1)![0])!);
    },
  });

  useHotkeys(
    "meta+j",
    () => {
      api.aiChat.show();
    },
    { enableOnContentEditable: true, enableOnFormTags: true },
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent
        className="w-64 p-0"
        align="start"
        onEscapeKeyDown={(e) => {
          e.preventDefault();

          if (isLoading) {
            api.aiChat.stop();
          } else {
            api.aiChat.hide();
          }
        }}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <InputCommand
              variant="ghost"
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:outline-none focus-visible:border-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              value={input}
              onKeyDown={(e) => {
                console.log(e.key);
                if (e.key === "Enter" && input.length === 0) {
                  e.preventDefault();
                  api.aiChat.hide();
                  return;
                }

                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void api.aiChat.submit();
                  return;
                }
              }}
              onValueChange={setInput}
              placeholder="Ask AI anything..."
              data-plate-focus
              autoFocus
              disabled={isLoading}
            />
          </div>

          {mode === "chat" && isSelecting && (messages ?? []).length > 0 && (
            <AIChatEditor aiEditorRef={aiEditorRef} />
          )}

          {isLoading ? (
            <div className="flex grow select-none items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              {messages.length > 1 ? "Editing..." : "Thinking..."}
            </div>
          ) : (
            <CommandList>
              <AIMenuItems aiEditorRef={aiEditorRef} setValue={setValue} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
