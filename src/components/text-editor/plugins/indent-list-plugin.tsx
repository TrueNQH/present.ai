"use client";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import { HEADING_LEVELS } from "@udecode/plate-heading";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";

import {
  TodoLi,
  TodoMarker,
} from "@/components/text-editor/plate-ui/indent-todo-marker";

export const indentListPlugins = [
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
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLi,
          markerComponent: TodoMarker,
          type: "todo",
        },
      },
    },
  }),
];
