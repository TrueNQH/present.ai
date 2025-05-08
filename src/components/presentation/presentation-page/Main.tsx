"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePresentationState } from "@/states/presentation-state";

import {
  type Themes,
  themes,
  setThemeVariables,
  type ThemeProperties,
} from "@/lib/presentation/themes";
import { useTheme } from "next-themes";

import { getCustomThemeById } from "@/app/_actions/presentation/theme-actions";
import debounce from "lodash.debounce";
import { PresentationSlidesView } from "./PresentationSlidesView";
import { LoadingState } from "./Loading";
import { PresentationLayout } from "./PresentationLayout";
import { type Value } from "@udecode/plate-common";
import {
  getPresentation,
  updatePresentationTheme,
} from "@/app/_actions/presentation/presentationActions";
import { type PlateNode, type PlateSlide } from "../utils/parser";
import { type ImageModelList } from "@/app/_actions/image/generate";

export default function PresentationPage() {
  const params = useParams();
  const id = params.id as string;
  const { resolvedTheme } = useTheme();
  const [shouldFetchData, setSetShouldFetchData] = useState(true);
  const {
    setCurrentPresentation,
    setPresentationInput,
    setOutline,
    setSlides,
    isGeneratingPresentation,
    setTheme,
    setImageModel,
    setPresentationStyle,
    setLanguage,
    theme,
  } = usePresentationState();

  useEffect(() => {
    if (isGeneratingPresentation) {
      setSetShouldFetchData(false);
    }
  }, [isGeneratingPresentation]);

  // Use React Query to fetch presentation data
  const { data: presentationData, isLoading } = useQuery({
    queryKey: ["presentation", id],
    queryFn: async () => {
      const result = await getPresentation(id);
      if (!result.success) {
        throw new Error(result.message ?? "Failed to load presentation");
      }
      return result.presentation;
    },
    enabled: !!id && !isGeneratingPresentation && shouldFetchData,
  });

  // Handle slide content changes
  const handleSlideChange = useCallback((value: Value, slideIndex: number) => {
    const { slides, isGeneratingPresentation, isPresenting } =
      usePresentationState.getState();

    if (isGeneratingPresentation || isPresenting) return;

    const updatedSlides = [...slides];
    // Make sure we have the slide at that index
    if (updatedSlides[slideIndex]) {
      // Update the content of the slide
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        content: value as PlateNode[],
      };

      // Update the global state
      setSlides(updatedSlides);
    }
  }, []);

  // Create a debounced function to update the theme in the database
  const debouncedThemeUpdate = useCallback(
    debounce((presentationId: string, newTheme: string) => {
      console.log("Updating theme in database:", newTheme);
      updatePresentationTheme(presentationId, newTheme)
        .then((result) => {
          if (result.success) {
            console.log("Theme updated in database");
          } else {
            console.error("Failed to update theme:", result.message);
          }
        })
        .catch((error) => {
          console.error("Error updating theme:", error);
        });
    }, 600),
    []
  );

  // Update presentation state when data is fetched
  useEffect(() => {
    // Skip if we're coming from the generation page
    if (isGeneratingPresentation || !shouldFetchData) {
      return;
    }

    if (presentationData) {
      console.log("Loading complete presentation data:", presentationData);
      setCurrentPresentation(presentationData.id, presentationData.title);
      setPresentationInput(presentationData.title);

      // Load all content from the database
      const presentationContent = presentationData.presentation?.content as {
        slides: PlateSlide[];
      };

      // Set slides
      setSlides(presentationContent?.slides ?? []);

      // Set outline
      if (presentationData.presentation?.outline) {
        setOutline(presentationData.presentation.outline);
      }

      // Set theme if available
      if (presentationData?.presentation?.theme) {
        const themeId = presentationData.presentation.theme;

        // Check if this is a predefined theme
        if (themeId in themes) {
          // Use predefined theme
          setTheme(themeId as Themes);
        } else {
          // If not in predefined themes, treat as custom theme
          void getCustomThemeById(themeId)
            .then((result) => {
              if (result.success && result.theme) {
                // Set the theme with the custom theme data
                const themeData = result.theme.themeData;
                setTheme(themeId, themeData as unknown as ThemeProperties);
              } else {
                // Fallback to default theme if custom theme not found
                console.warn("Custom theme not found:", themeId);
                setTheme("mystique");
              }
            })
            .catch((error) => {
              console.error("Failed to load custom theme:", error);
              // Fallback to default theme on error
              setTheme("mystique");
            });
        }
      }

      // Set imageModel if available
      if (presentationData?.presentation?.imageModel) {
        setImageModel(
          presentationData?.presentation?.imageModel as ImageModelList
        );
      }

      // Set presentationStyle if available
      if (presentationData?.presentation?.presentationStyle) {
        setPresentationStyle(presentationData.presentation.presentationStyle);
      }

      // Set language if available
      if (presentationData.presentation?.language) {
        setLanguage(presentationData.presentation.language);
      }
    }
  }, [
    presentationData,
    isGeneratingPresentation,
    shouldFetchData,
    setCurrentPresentation,
    setPresentationInput,
    setOutline,
    setSlides,
    setTheme,
    setImageModel,
    setPresentationStyle,
    setLanguage,
  ]);

  // Update theme when it changes
  useEffect(() => {
    if (theme && id && !isLoading) {
      debouncedThemeUpdate(id, theme);
    }
  }, [theme, id, debouncedThemeUpdate, isLoading]);

  // Set theme variables when theme changes
  useEffect(() => {
    if (theme && resolvedTheme) {
      const state = usePresentationState.getState();

      // Check if we have custom theme data
      if (state.customThemeData) {
        setThemeVariables(state.customThemeData, resolvedTheme === "dark");
      }
      // Otherwise try to use a predefined theme
      else if (typeof theme === "string" && theme in themes) {
        const currentTheme = themes[theme as keyof typeof themes];
        if (currentTheme) {
          setThemeVariables(currentTheme, resolvedTheme === "dark");
        }
      }
    }
  }, [theme, resolvedTheme]);

  // Get the current theme data
  const currentThemeData = (() => {
    const state = usePresentationState.getState();
    if (state.customThemeData) {
      return state.customThemeData;
    }
    if (typeof theme === "string" && theme in themes) {
      return themes[theme as keyof typeof themes];
    }
    return null;
  })();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PresentationLayout
      isLoading={isLoading}
      themeData={currentThemeData ?? undefined}
    >
      <div className="mx-auto max-w-[90%] space-y-8 p-8 pt-16">
        <div className="space-y-8">
          <PresentationSlidesView
            handleSlideChange={handleSlideChange}
            isGeneratingPresentation={isGeneratingPresentation}
          />
        </div>
      </div>
    </PresentationLayout>
  );
}
