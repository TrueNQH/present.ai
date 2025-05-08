"use client";

import { Label } from "@/components/ui/label";
import { FontPicker } from "@/components/ui/font-picker";
import "react-fontpicker-ts/dist/index.css";
import "@/components/ui/font-picker.css";
interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function FontSelector({ value, onChange, label }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <FontPicker
        value={value}
        onChange={onChange}
        autoLoad={true}
        mode="combo"
      />
    </div>
  );
}
