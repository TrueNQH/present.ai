"use client";

import { ParagraphPlugin } from "@udecode/plate-common/react";
import { ImagePlugin } from "@udecode/plate-media/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
} from "@udecode/plate-basic-marks/react";
import { ColumnPlugin, ColumnItemPlugin } from "@udecode/plate-layout/react";
import { autoformatPlugin } from "@/components/text-editor/plugins/autoformat-plugin";
import { softBreakPlugin } from "@/components/text-editor/plugins/soft-break-plugin";
import { exitBreakPlugin } from "@/components/text-editor/plugins/exit-break-plugin";
import { resetBlockTypePlugin } from "@/components/text-editor/plugins/reset-block-type-plugin";
import { blockSelectionPlugins } from "@/components/text-editor/plugins/block-selection-plugin";
import { dndPlugins } from "@/components/text-editor/plugins/dnd-plugin";
import { VisualizationListPlugin } from "./custom-elements/visualization-list-plugin";
import { VisualizationItemPlugin } from "./custom-elements/visualization-item-plugin";
import {
  SlashInputPlugin,
  SlashPlugin,
} from "@udecode/plate-slash-command/react";
import {
  BulletPlugin,
  BulletsPlugin,
} from "./custom-elements/bullets-elements";
import {
  StaircasePlugin,
  StairItemPlugin,
} from "./custom-elements/staircase-element";
import { CycleItemPlugin, CyclePlugin } from "./custom-elements/cycle-element";
import { FontFamilyPlugin } from "@udecode/plate-font/react";
import { IconPlugin } from "./custom-elements/icon";
import { IconItemPlugin, IconsPlugin } from "./custom-elements/icons-element";
import { GeneratingPlugin } from "./custom-elements/generating-leaf";
// Create presentation-specific plugins
export const presentationPlugins = [
  // Basic nodes
  HeadingPlugin.configure({
    options: { levels: 6 },
  }),
  BlockquotePlugin,
  ParagraphPlugin,

  FontFamilyPlugin,
  // Basic marks
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,

  // Media
  ImagePlugin.extend({
    options: { disableUploadInsert: false },
  }),

  // Layout
  ColumnPlugin.configure({
    options: {
      spacing: 20,
    },
  }),
  ColumnItemPlugin,

  // Custom ELements
  VisualizationListPlugin,
  VisualizationItemPlugin,

  BulletPlugin,
  BulletsPlugin,

  StaircasePlugin,
  StairItemPlugin,

  IconPlugin,
  IconsPlugin,
  IconItemPlugin,

  CycleItemPlugin,
  CyclePlugin,

  GeneratingPlugin,
  // Functionality
  autoformatPlugin,
  exitBreakPlugin,
  resetBlockTypePlugin,
  ...blockSelectionPlugins,
  softBreakPlugin,
  ...dndPlugins,
  SlashInputPlugin,
  SlashPlugin,
  // Deserialization
  MarkdownPlugin.configure({ options: { indentList: true } }),
] as const;
