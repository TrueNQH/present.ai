"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ThemeFormValues } from "./types";

interface ThemePreviewProps {
  colors: ThemeFormValues["colors"];
  fonts: ThemeFormValues["fonts"];
  borderRadius: string;
  logoPreview: string | null;
  activeColorTab: "light" | "dark";
}

export function ThemePreview({
  colors,
  fonts,
  borderRadius,
  logoPreview,
  activeColorTab,
}: ThemePreviewProps) {
  const currentColors = activeColorTab === "light" ? colors.light : colors.dark;

  return (
    <Card
      className="mt-4 p-6"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
        borderRadius,
        transition: "all 0.2s ease-in-out",
      }}
    >
      {logoPreview && (
        <div className="mb-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoPreview}
            alt="Theme Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
      )}
      <h2
        className="mb-2 text-2xl font-bold"
        style={{
          color: currentColors.heading,
          fontFamily: fonts.heading,
        }}
      >
        Your Theme Preview
      </h2>
      <p
        className="mb-4"
        style={{
          color: currentColors.text,
          fontFamily: fonts.body,
        }}
      >
        This is how your theme will look. You can see the text, buttons, and
        other elements styled according to your theme settings.
      </p>
      <div className="flex gap-2">
        <Button
          style={{
            backgroundColor: currentColors.primary,
            color: currentColors.background,
          }}
        >
          Primary Button
        </Button>
        <Button
          variant="secondary"
          style={{
            backgroundColor: currentColors.secondary,
            color: currentColors.background,
          }}
        >
          Secondary Button
        </Button>
      </div>
    </Card>
  );
}
