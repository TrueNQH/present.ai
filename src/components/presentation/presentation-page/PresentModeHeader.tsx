"use client";

import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";

export function PresentModeHeader({ showHeader, presentationTitle }) {
  return (
    <div
      className={`fixed left-0 right-0 top-0 z-[1000] transition-all duration-300 ${
        showHeader ? "translate-y-0" : "translate-y-[-100%]"
      }`}
    >
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-white">
              {presentationTitle}
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() =>
                usePresentationState.getState().setIsPresenting(false)
              }
            >
              Exit Presentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
