"use client";

import { useEffect, useMemo, useState } from "react";

import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react";
import {
  getAncestorNode,
  getEndPoint,
  getNodeString,
} from "@udecode/plate-common";
import {
  type PlateEditor,
  focusEditor,
  useEditorPlugin,
} from "@udecode/plate-common/react";
import { useIsSelecting } from "@udecode/plate-selection/react";
import {
  Album,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  PenLine,
  Wand,
  X,
  Languages,
  UserRound,
  Briefcase,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import { CommandGroup, CommandItem } from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type EditorChatState =
  | "cursorCommand"
  | "cursorSuggestion"
  | "selectionCommand"
  | "selectionSuggestion";

interface TranslatePopoverProps {
  editor: PlateEditor;
}

const TranslatePopover: React.FC<TranslatePopoverProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CommandItem value="translate">
        <PopoverTrigger
          className="
        relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-sm text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
        >
          <div className="flex items-center text-violet-500">
            <Languages className="mr-2 h-4 w-4" />
            <span className="text-primary">Translate to</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </PopoverTrigger>
      </CommandItem>
      <PopoverContent side="right" align="start" className="w-48 p-0">
        <CommandGroup className="max-h-[300px] overflow-y-auto">
          {supportedLanguages.map((lang) => (
            <CommandItem
              key={lang.code}
              value={`translate_${lang.code}`}
              onSelect={() => {
                void editor.getApi(AIChatPlugin).aiChat.submit({
                  prompt: `Translate the text to ${lang.name}, maintaining the original meaning and tone`,
                });
                setOpen(false);
              }}
              className="px-2 py-1.5"
            >
              {lang.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </PopoverContent>
    </Popover>
  );
};

const TonePopover: React.FC<TranslatePopoverProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);

  const toneOptions = [
    {
      name: "Friendly",
      value: "makeFriendly",
      icon: <UserRound className="h-4 w-4 text-pink-500" />,
    },
    {
      name: "Professional",
      value: "makeProfessional",
      icon: <Briefcase className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CommandItem value="tone">
        <PopoverTrigger className="relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-sm text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          <div className="flex items-center text-pink-500">
            <UserRound className="mr-2 h-4 w-4" />
            <span className="text-primary">Change tone</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </PopoverTrigger>
      </CommandItem>
      <PopoverContent side="right" align="start" className="w-48 p-0">
        <CommandGroup>
          {toneOptions.map((tone) => (
            <CommandItem
              key={tone.value}
              value={tone.value}
              onSelect={() => {
                void editor.getApi(AIChatPlugin).aiChat.submit({
                  prompt:
                    tone.value === "makeFriendly"
                      ? "Make the tone more friendly and casual while maintaining the key message"
                      : "Make the tone more professional and formal while preserving the core content",
                });
                setOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              {tone.icon}
              <span>{tone.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </PopoverContent>
    </Popover>
  );
};

interface Language {
  name: string;
  code: string;
}

interface EditorProps {
  aiEditor: PlateEditor;
  editor: PlateEditor;
}

interface MenuItemComponentProps {
  menuState: EditorChatState;
  editor: PlateEditor;
}

interface AIMenuItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  component?: React.ComponentType<MenuItemComponentProps>;
  filterItems?: boolean;
  items?: { label: string; value: string }[];
  shortcut?: string;
  onSelect?: (props: EditorProps) => void;
}

const supportedLanguages: Language[] = [
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Italian", code: "it" },
  { name: "Portuguese", code: "pt" },
  { name: "Chinese", code: "zh" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Russian", code: "ru" },
  { name: "Arabic", code: "ar" },
  { name: "Hindi", code: "hi" },
  { name: "Dutch", code: "nl" },
  { name: "Polish", code: "pl" },
  { name: "Turkish", code: "tr" },
  { name: "Vietnamese", code: "vi" },
];

export const aiChatItems: Record<string, AIMenuItem> = {
  accept: {
    icon: <Check className="text-green-500" />,
    label: "Accept",
    value: "accept",
    onSelect: ({ editor }: EditorProps) => {
      editor.getTransforms(AIChatPlugin).aiChat.accept();
      focusEditor(editor, getEndPoint(editor, editor.selection!));
    },
  },
  continueWrite: {
    icon: <PenLine className="text-blue-500" />,
    label: "Continue writing",
    value: "continueWrite",
    onSelect: ({ editor }: EditorProps) => {
      const ancestorNode = getAncestorNode(editor);

      if (!ancestorNode) return;

      const isEmpty = getNodeString(ancestorNode[0]).trim().length === 0;

      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: isEmpty
          ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
          : "Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.",
      });
    },
  },
  discard: {
    icon: <X className="text-red-500" />,
    label: "Discard",
    shortcut: "Escape",
    value: "discard",
    onSelect: ({ editor }: EditorProps) => {
      editor?.getTransforms(AIPlugin)?.ai?.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
    },
  },
  explain: {
    icon: <HelpCircle className="text-purple-500" />,
    label: "Explain",
    value: "explain",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: {
          default: "Explain {editor}",
          selecting: "Explain",
        },
      });
    },
  },
  fixSpelling: {
    icon: <Check className="text-green-500" />,
    label: "Fix spelling & grammar",
    value: "fixSpelling",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Fix spelling and grammar",
      });
    },
  },
  improveWriting: {
    icon: <Wand className="text-purple-500" />,
    label: "Improve writing",
    value: "improveWriting",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Improve the writing",
      });
    },
  },
  insertBelow: {
    icon: <ListEnd />,
    label: "Insert below",
    value: "insertBelow",
    onSelect: ({ aiEditor, editor }: EditorProps) => {
      void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor);
    },
  },
  makeLonger: {
    icon: <ListPlus className="text-green-500" />,
    label: "Make longer",
    value: "makeLonger",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make longer",
      });
    },
  },
  makeShorter: {
    icon: <ListMinus className="text-orange-500" />,
    label: "Make shorter",
    value: "makeShorter",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make shorter",
      });
    },
  },
  replace: {
    icon: <Check />,
    label: "Replace selection",
    value: "replace",
    onSelect: ({ aiEditor, editor }: EditorProps) => {
      void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: "Simplify language",
    value: "simplifyLanguage",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Simplify the language",
      });
    },
  },
  summarize: {
    icon: <Album />,
    label: "Add a summary",
    value: "summarize",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: {
          default: "Summarize {editor}",
          selecting: "Summarize",
        },
      });
    },
  },

  translate: {
    icon: (
      <span className="text-violet-500">
        <Languages className="h-4 w-4" />
      </span>
    ),
    label: "Translate to",
    value: "translate",
    component: ({ editor }: MenuItemComponentProps) => (
      <TranslatePopover editor={editor} />
    ),
    filterItems: true,
  },
  tryAgain: {
    icon: <CornerUpLeft className="text-yellow-500" />,
    label: "Try again",
    value: "tryAgain",
    onSelect: ({ editor }: EditorProps) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
    },
  },
  tone: {
    icon: <UserRound className="text-pink-500" />,
    label: "Change tone",
    value: "tone",
    component: ({ editor }: MenuItemComponentProps) => (
      <TonePopover editor={editor} />
    ),
    filterItems: true,
  },
};

interface MenuStateGroup {
  items: AIMenuItem[];
  heading?: string;
}

const menuStateItems: Record<EditorChatState, MenuStateGroup[]> = {
  cursorCommand: [
    {
      items: [
        aiChatItems.continueWrite!,
        aiChatItems.summarize!,
        aiChatItems.explain!,
      ],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept!, aiChatItems.discard!, aiChatItems.tryAgain!],
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting!,
        aiChatItems.makeLonger!,
        aiChatItems.makeShorter!,
        aiChatItems.fixSpelling!,
        aiChatItems.simplifyLanguage!,
        aiChatItems.tone!,
        aiChatItems.translate!,
      ],
    },
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItems.replace!,
        aiChatItems.insertBelow!,
        aiChatItems.discard!,
        aiChatItems.tryAgain!,
      ],
    },
  ],
};

interface AIMenuItemsProps {
  aiEditorRef: React.MutableRefObject<PlateEditor | null>;
  setValue: (value: string) => void;
}

export const AIMenuItems: React.FC<AIMenuItemsProps> = ({
  aiEditorRef,
  setValue,
}) => {
  const { editor, useOption } = useEditorPlugin(AIChatPlugin);
  const { messages } = useOption("chat");
  const isSelecting = useIsSelecting();

  const menuState = useMemo((): EditorChatState => {
    if (messages && messages.length > 0) {
      return isSelecting ? "selectionSuggestion" : "cursorSuggestion";
    }
    return isSelecting ? "selectionCommand" : "cursorCommand";
  }, [isSelecting, messages]);

  const menuGroups = useMemo(() => {
    return menuStateItems[menuState];
  }, [menuState]);

  useEffect(() => {
    if (
      menuGroups.length > 0 &&
      menuGroups[0] &&
      menuGroups[0].items.length > 0
    ) {
      setValue(menuGroups[0]?.items[0]?.value ?? "");
    }
  }, [menuGroups, setValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map((menuItem) => {
            if (menuItem.component) {
              const MenuItemComponent = menuItem.component;
              return (
                <MenuItemComponent
                  key={menuItem.value}
                  menuState={menuState}
                  editor={editor}
                />
              );
            }
            return (
              <CommandItem
                key={menuItem.value}
                className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent"
                value={menuItem.value}
                onSelect={() => {
                  menuItem.onSelect?.({
                    aiEditor: aiEditorRef.current!,
                    editor: editor,
                  });
                }}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  {menuItem.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{menuItem.label}</span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      ))}
    </>
  );
};
