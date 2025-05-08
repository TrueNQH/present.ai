"use client";

import { CaptionPlugin } from "@udecode/plate-caption/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";

export const mediaPlugins = [
  ImagePlugin.extend({
    options: { disableUploadInsert: false },
  }),
  MediaEmbedPlugin,
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  CaptionPlugin.configure({
    options: {
      plugins: [ImagePlugin, VideoPlugin, AudioPlugin, MediaEmbedPlugin],
    },
  }),
  PlaceholderPlugin,
] as const;
