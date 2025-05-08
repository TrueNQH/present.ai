import { useEffect } from "react";
import { usePresentationState } from "@/states/presentation-state";
import { useDebouncedSave } from "./useDebouncedSave";

interface UseSlideChangeWatcherOptions {
  /**
   * The delay in milliseconds before triggering a save.
   * @default 1000
   */
  debounceDelay?: number;
}

/**
 * A hook that watches for changes to the slides and triggers
 * a debounced save function whenever changes are detected.
 */
export const useSlideChangeWatcher = (
  options: UseSlideChangeWatcherOptions = {}
) => {
  const { debounceDelay = 1000 } = options;
  const { slides, isGeneratingPresentation } = usePresentationState();
  const { save, saveImmediately } = useDebouncedSave({ delay: debounceDelay });

  // Watch for changes to the slides array and trigger save
  useEffect(() => {
    // Only save if we have slides and we're not generating
    if (slides.length > 0) {
      save();
    }
  }, [slides, save, isGeneratingPresentation]);

  return {
    // Expose the immediate save function for manual saving
    saveImmediately,
  };
};
