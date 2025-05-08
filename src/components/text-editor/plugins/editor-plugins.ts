"use client";

import { CalloutPlugin } from "@udecode/plate-callout/react";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
} from "@udecode/plate-font/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnPlugin } from "@udecode/plate-layout/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";

import { aiPlugins } from "./ai-plugins";
import { alignPlugin } from "./align-plugin";
import { autoformatPlugin } from "./autoformat-plugin";
import { basicNodesPlugins } from "./basic-nodes-plugins";
import { cursorOverlayPlugin } from "./cursor-overlay-plugin";
import { deletePlugins } from "./delete-plugin";
import { dndPlugins } from "./dnd-plugin";
import { exitBreakPlugin } from "./exit-break-plugin";
import { indentListPlugins } from "./indent-list-plugin";
import { lineHeightPlugin } from "./line-height-plugin";
import { linkPlugin } from "./link-plugin";
import { mediaPlugins } from "./media-plugin";
import { resetBlockTypePlugin } from "./reset-block-type-plugin";
import { softBreakPlugin } from "./soft-break-plugin";
import { tablePlugin } from "./table-plugin";
import {
  BoldPlugin,
  StrikethroughPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { blockSelectionPlugins } from "./block-selection-plugin";

export const viewPlugins = [
  ...basicNodesPlugins,
  HorizontalRulePlugin,
  linkPlugin,
  DatePlugin,
  tablePlugin,
  TogglePlugin,
  ...mediaPlugins,
  InlineEquationPlugin,
  EquationPlugin,
  CalloutPlugin,
  ColumnPlugin,

  // Marks
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
  HighlightPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  KbdPlugin,

  // Block Style
  alignPlugin,
  ...indentListPlugins,
  lineHeightPlugin,
] as const;

export const editorPlugins = [
  // AI
  ...aiPlugins,

  // Nodes
  ...viewPlugins,

  // Functionality
  SlashPlugin,
  autoformatPlugin,
  cursorOverlayPlugin,
  ...blockSelectionPlugins,
  ...dndPlugins,
  EmojiPlugin,
  exitBreakPlugin,
  resetBlockTypePlugin,
  ...deletePlugins,
  softBreakPlugin,
  TrailingBlockPlugin.configure({ options: { type: ParagraphPlugin.key } }),
  // Deserialization
  MarkdownPlugin.configure({ options: { indentList: true } }),
  JuicePlugin,
] as const;
