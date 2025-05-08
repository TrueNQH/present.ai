import { type Themes } from "@/lib/presentation/themes";

export type ThemeFormValues = {
  name: string;
  description: string;
  isPublic: boolean;
  themeBase: Themes | "blank";
  colors: {
    light: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      heading: string;
      muted: string;
    };
    dark: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      heading: string;
      muted: string;
    };
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  transitions: {
    default: string;
  };
  shadows: {
    light: {
      card: string;
      button: string;
    };
    dark: {
      card: string;
      button: string;
    };
  };
};

export type ColorKey = keyof ThemeFormValues["colors"]["light"];
export type ColorMode = "light" | "dark";

export const fontOptions = [
  "Inter, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "Roboto, sans-serif",
  "Playfair Display, serif",
  "Merriweather, serif",
  "Lora, serif",
  "Source Sans Pro, sans-serif",
  "DM Sans, sans-serif",
  "JetBrains Mono, monospace",
  "Raleway, sans-serif",
  "Open Sans, sans-serif",
];
