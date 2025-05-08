"use client";

import React from "react";
import Prism from "prismjs";
import { withProps } from "@udecode/cn";
import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react";
import {
  BasicMarksPlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@udecode/plate-code-block/react";
import {
  ParagraphPlugin,
  PlateLeaf,
  createPlateEditor,
} from "@udecode/plate-common/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";

import { BlockquoteElement } from "@/components/text-editor/plate-ui//blockquote-element";
import { CodeLeaf } from "@/components/text-editor/plate-ui//code-leaf";
import { CodeLineElement } from "@/components/text-editor/plate-ui//code-line-element";
import { CodeSyntaxLeaf } from "@/components/text-editor/plate-ui//code-syntax-leaf";
import { HeadingElement } from "@/components/text-editor/plate-ui//heading-element";
import { HrElement } from "@/components/text-editor/plate-ui//hr-element";
import { LinkElement } from "@/components/text-editor/plate-ui//link-element";
import { ParagraphElement } from "@/components/text-editor/plate-ui//paragraph-element";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { LinkFloatingToolbar } from "../plate-ui/link-floating-toolbar";
import { AIMenu } from "../plate-ui/ai-menu";

const createAIEditor = () => {
  const editor = createPlateEditor({
    id: "ai",
    override: {
      components: {
        [BlockquotePlugin.key]: BlockquoteElement,
        [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
        [CodeLinePlugin.key]: CodeLineElement,
        [CodePlugin.key]: CodeLeaf,
        [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
        [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
        [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
        [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
        [HorizontalRulePlugin.key]: HrElement,
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
        [LinkPlugin.key]: LinkElement,
        [ParagraphPlugin.key]: ParagraphElement,
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
      },
    },
    plugins: [
      HeadingPlugin.configure({ options: { levels: 3 } }),
      BlockquotePlugin,
      CodeBlockPlugin.configure({ options: { prism: Prism } }),
      BasicMarksPlugin,
      BlockSelectionPlugin.configure({
        inject: {
          excludeBelowPlugins: ["tr"],
          excludePlugins: ["table", "code_line", "column_group", "column"],
        },
        options: {
          enableContextMenu: true,
        },
      }),
      IndentPlugin.extend({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            ...HEADING_LEVELS,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
          ],
        },
      }),
      IndentListPlugin.extend({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            ...HEADING_LEVELS,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            TogglePlugin.key,
          ],
        },
      }),
      LinkPlugin.extend({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
    ],
  });

  return editor;
};

const systemCommon = `\
You are an advanced AI-powered note-taking assistant, designed to enhance productivity and creativity in note management.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
`;

const systemDefault = `\
${systemCommon}
- <Block> is the current block of text the user is working on.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- CRITICAL: Provide only a single block of text. DO NOT create multiple paragraphs or separate blocks.
<Block>
{block}
</Block>
`;

const systemSelecting = `\
${systemCommon}
- <Block> is the block of text containing the user's selection, providing context.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>.
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
`;

const systemBlockSelecting = `\
${systemCommon}
- <Selection> represents the full blocks of text the user has selected and wants to modify or ask about.
- Your response should be a direct replacement for the entire <Selection>.
- Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
- CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
<Selection>
{block}
</Selection>
`;

const userDefault = `<Reminder>
CRITICAL: DO NOT use block formatting. You can only use inline formatting.
CRITICAL: DO NOT start new lines or paragraphs.
NEVER write <Block>.
</Reminder>
{prompt}`;

const userSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>`;

const userBlockSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the content to replace the entire <Selection>. No explanations.
Maintain the overall structure unless instructed otherwise.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>`;

export const PROMPT_TEMPLATES = {
  systemBlockSelecting,
  systemDefault,
  systemSelecting,
  userBlockSelecting,
  userDefault,
  userSelecting,
};

export const aiPlugins = [
  MarkdownPlugin.configure({ options: { indentList: true } }),
  AIPlugin,
  AIChatPlugin.configure({
    options: {
      createAIEditor,
      promptTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.userBlockSelecting
          : isSelecting
          ? PROMPT_TEMPLATES.userSelecting
          : PROMPT_TEMPLATES.userDefault;
      },
      systemTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.systemBlockSelecting
          : isSelecting
          ? PROMPT_TEMPLATES.systemSelecting
          : PROMPT_TEMPLATES.systemDefault;
      },
    },
    render: { afterEditable: () => <AIMenu /> },
  }),
] as const;
