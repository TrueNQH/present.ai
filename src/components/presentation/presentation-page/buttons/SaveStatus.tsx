"use client";
import { CheckCircle, Loader2 } from "lucide-react";
import { usePresentationState } from "@/states/presentation-state";

export function SaveStatus() {
  const { savingStatus } = usePresentationState();

  if (savingStatus === "idle") return null;

  if (savingStatus === "saving") {
    return (
      <span className="flex animate-pulse items-center gap-1 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </span>
    );
  }

  if (savingStatus === "saved") {
    return (
      <span className="flex items-center gap-1 text-sm text-green-500">
        <CheckCircle className="h-3.5 w-3.5" />
      </span>
    );
  }

  return null;
}
