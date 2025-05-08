import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="h-screen w-screen">
      <Loader2 className="animate-spin"></Loader2>
    </div>
  );
}
