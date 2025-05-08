"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <Label>{label}</Label>
      <div
        className="mt-2 h-10 w-full cursor-pointer rounded-md border"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      {showPicker && (
        <div className="absolute left-0 top-full z-50 mt-2">
          <div className="fixed inset-0" onClick={() => setShowPicker(false)} />
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
