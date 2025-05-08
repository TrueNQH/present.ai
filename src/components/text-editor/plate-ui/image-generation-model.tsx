import React, { useState } from "react";
import { usePresentationState } from "@/states/presentation-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorRef } from "@udecode/plate-core/react";
import {
  generateImageAction,
  type ImageModelList,
} from "@/app/_actions/image/generate";
import { toast } from "sonner";
import { insertNodes } from "@udecode/plate-common";
import { ImagePlugin } from "@udecode/plate-media/react";
import { FloatingInput } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const MODEL_OPTIONS = [
  {
    label: "Flux.1 [schnell] (free)",
    value: "black-forest-labs/FLUX.1-schnell-Free",
  },
  {
    label: "Flux.1 [schnell] (Turbo)",
    value: "black-forest-labs/FLUX.1-schnell",
  },
  {
    label: "Flux1.1 [pro]",
    value: "black-forest-labs/FLUX.1.1-pro",
  },
  {
    label: "Flux.1 [pro]",
    value: "black-forest-labs/FLUX.1-pro",
  },
];

export function GenerateImageDialogContent({
  setOpen,
  isGenerating,
  setIsGenerating,
}: {
  setOpen: (value: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModelList>(
    "black-forest-labs/FLUX.1-schnell-Free"
  );

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateImageAction(prompt, selectedModel);

      if (!result.success || !result.image?.url) {
        throw new Error(result.error ?? "Failed to generate image");
      }

      insertNodes(editor, {
        children: [{ text: "" }],
        type: ImagePlugin.key,
        url: result.image.url,
        query: prompt,
      });

      setOpen(false);
      toast.success("Image generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Generate Image with AI</AlertDialogTitle>
        <AlertDialogDescription>
          Enter a detailed description of the image you want to generate
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4">
        <div className="relative w-full">
          <FloatingInput
            id="prompt"
            className="w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating) void generateImage();
            }}
            label="Prompt"
            type="text"
            autoFocus
            disabled={isGenerating}
          />
        </div>

        {isGenerating && (
          <div className="mt-4 space-y-3">
            <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="text-center text-sm text-gray-500">
              Generating your image...
            </div>
          </div>
        )}
      </div>

      <AlertDialogFooter>
        <Select
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value as ImageModelList)}
          disabled={isGenerating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <AlertDialogCancel disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void generateImage();
            }}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>
    </>
  );
}

export default function ImageGenerationModel() {
  const { imageGenerationModelOpen, setImageGenerationModelOpen } =
    usePresentationState();
  const [isGenerating, setIsGenerating] = useState(false);
  return (
    <AlertDialog
      open={imageGenerationModelOpen}
      onOpenChange={(value) => {
        setImageGenerationModelOpen(value);
        setIsGenerating(false);
      }}
    >
      <AlertDialogContent className="gap-6">
        <GenerateImageDialogContent
          setOpen={setImageGenerationModelOpen}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
