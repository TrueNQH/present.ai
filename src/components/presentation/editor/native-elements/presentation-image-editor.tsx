import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw,
  Download,
  Trash2,
  Wand2,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { usePresentationState } from "@/states/presentation-state";
import { IMAGE_MODELS } from "../../theme/ThemeSettings";
import { type ImageModelList } from "@/app/_actions/image/generate";

export interface PresentationImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  prompt?: string;
  isGenerating?: boolean;
  error?: string;
  onRegenerateWithSamePrompt: () => void;
  onGenerateWithNewPrompt: (prompt: string) => void;
}

export const PresentationImageEditor = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  isGenerating = false,
  error,
  onRegenerateWithSamePrompt,
  onGenerateWithNewPrompt,
}: PresentationImageEditorProps) => {
  const { imageModel, setImageModel } = usePresentationState();
  const [newPrompt, setNewPrompt] = useState(prompt ?? "");

  // Local error state for UI validation
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGenerateClick = () => {
    if (!newPrompt.trim()) {
      setLocalError("Please enter a prompt first");
      return;
    }

    setLocalError(null);
    onGenerateWithNewPrompt(newPrompt);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-xl overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Image Generator</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation error */}
          {localError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {/* Image preview */}
          <div className="relative overflow-hidden rounded-md border border-border bg-muted">
            {isGenerating ? (
              <div className="flex h-60 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="h-6 w-6" />
                  <span className="text-sm text-muted-foreground">
                    Generating image...
                  </span>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="relative">
                {/* 
                eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={prompt ?? "Presentation image"}
                  className="h-auto max-h-[300px] w-full object-contain"
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-10 w-10 opacity-50" />
                  <span>No image generated yet</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image Prompt</label>
            <Textarea
              placeholder="Describe the image you want to generate..."
              className="min-h-[100px]"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Image Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image Model</label>
            <Select
              value={imageModel}
              onValueChange={(value) => setImageModel(value as ImageModelList)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select image model" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleGenerateClick}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate New
                </>
              )}
            </Button>

            {imageUrl && (
              <Button
                variant="outline"
                onClick={onRegenerateWithSamePrompt}
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
