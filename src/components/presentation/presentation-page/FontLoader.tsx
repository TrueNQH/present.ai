"use client";

import dynamic from "next/dynamic";
import { type ThemeProperties } from "@/lib/presentation/themes";

// Using dynamic import since FontPicker uses browser APIs
const DynamicFontPicker = dynamic(
  () => import("react-fontpicker-ts").then((mod) => mod.default),
  { ssr: false },
);

// Component to load fonts for custom themes
export function CustomThemeFontLoader({
  themeData,
}: {
  themeData: ThemeProperties;
}) {
  const fonts = [themeData.fonts.heading, themeData.fonts.body];

  return (
    <div style={{ display: "none" }}>
      <DynamicFontPicker defaultValue={fonts[0]} loadFonts={fonts} loaderOnly />
    </div>
  );
}
