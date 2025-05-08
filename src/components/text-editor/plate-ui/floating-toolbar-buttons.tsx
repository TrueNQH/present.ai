import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { useEditorReadOnly } from "@udecode/plate-common/react";

import { Icons } from "@/components/text-editor/icons";
import { LinkToolbarButton } from "@/components/text-editor/plate-ui/link-toolbar-button";
import { FontFamilyToolbarButton } from "@/components/text-editor/plate-ui/font-family-toolbar-button";
import { MarkToolbarButton } from "@/components/text-editor/plate-ui/mark-toolbar-button";
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/text-editor/plate-ui/toolbar";

import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
import { MoreDropdownMenu } from "./more-dropdown-menu";
import { AIToolbarButton } from "./ai-toolbar-button";
import { WandSparklesIcon } from "lucide-react";

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <TurnIntoDropdownMenu />
          <ToolbarSeparator />
          <FontFamilyToolbarButton />
          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <Icons.bold />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <Icons.italic />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <Icons.underline />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <Icons.strikethrough />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Icons.code />
            </MarkToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <LinkToolbarButton />
        </>
      )}

      {!readOnly && <MoreDropdownMenu />}
    </>
  );
}
