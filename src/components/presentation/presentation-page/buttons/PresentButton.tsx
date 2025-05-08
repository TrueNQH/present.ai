"use client";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { cn } from "@/lib/utils";

export function PresentButton() {
  const {
    isPresenting,
    setIsPresenting,
    isGeneratingPresentation,
    isGeneratingOutline,
  } = usePresentationState();

  // Check if generation is in progress
  const isGenerating = isGeneratingPresentation || isGeneratingOutline;

  return (
    <Button
      size="sm"
      className={cn(
        isPresenting
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-purple-600 text-white hover:bg-purple-700",
        isGenerating && "cursor-not-allowed opacity-70"
      )}
      onClick={() => !isGenerating && setIsPresenting(!isPresenting)}
      disabled={isGenerating}
    >
      {isPresenting ? (
        <>
          <X className="mr-1 h-4 w-4" />
          Exit
        </>
      ) : (
        <>
          <Play className="mr-1 h-4 w-4" />
          Present
        </>
      )}
    </Button>
  );
}
