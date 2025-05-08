"use client";

import { cn } from "@udecode/cn";
import { ImagePlugin } from "@udecode/plate-media/react";
import { usePresentationState } from "@/states/presentation-state";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useId, useRef, useState } from "react";
import { DndPlugin, type DragItemNode } from "@udecode/plate-dnd";
import { type DragSourceMonitor } from "react-dnd";
import { PresentationImageEditor } from "./presentation-image-editor";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { useEditorRef } from "@udecode/plate-core/react";
import { generateImageAction } from "@/app/_actions/image/generate";
import { type PlateSlide } from "../../utils/parser";
import { useDraggable } from "../dnd/hooks/useDraggable";

export default function RootImage({
  image,
  slideIndex,
  layoutType,
  shouldGenerate = true,
}: {
  image: { query: string; url?: string };
  slideIndex: number;
  layoutType?: string;
  shouldGenerate?: boolean;
}) {
  const { setSlides, imageModel } = usePresentationState();
  const { saveImmediately } = useDebouncedSave();
  const id = useId();
  const [imageUrl, setImageUrl] = useState<string | undefined>(image.url);
  const [isGenerating, setIsGenerating] = useState(!image.url);
  // Use a ref to track if we've already handled image generation
  const hasHandledGenerationRef = useRef(false);
  // State for image editor sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // State for error handling
  const [error, setError] = useState<string | undefined>();
  // State for showing delete popover
  const [showDeletePopover, setShowDeletePopover] = useState(false);
  const editor = useEditorRef();
  // Create a fake element for dragging - with a unique ID
  const element = {
    id: id, // Unique ID to differentiate from editor nodes
    type: ImagePlugin.key,
    url: imageUrl,
    query: image.query,
    children: [{ text: "" }],
  };

  // Generate image with the given prompt
  const generateImage = async (prompt: string) => {
    if (!shouldGenerate) {
      return;
    }
    setIsGenerating(true);
    setError(undefined);
    try {
      const result = await generateImageAction(prompt, imageModel);
      if (result.image?.url) {
        const newImageUrl = result.image.url;
        setImageUrl(newImageUrl);

        // Get current slides state
        const { slides } = usePresentationState.getState();

        // Create updated slides array
        const updatedSlides = slides.map((slide: PlateSlide, index: number) => {
          if (index === slideIndex) {
            return {
              ...slide,
              rootImage: {
                query: prompt,
                url: newImageUrl,
              },
            };
          }
          return slide;
        });

        // Update slides with new array - use a timeout to ensure state update happens
        // This will trigger a re-render of both the editor and preview
        setTimeout(() => {
          setSlides(updatedSlides);

          // Force an immediate save to ensure the image URL is persisted
          void saveImmediately();
        }, 100);

        // Ensure the generating state is properly reset
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate image. Please try again.");
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate image if query is provided but no URL exists
  useEffect(() => {
    // Skip if we've already handled this element or if there's no query or if URL already exists
    if (
      hasHandledGenerationRef.current ||
      !image.query ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      image.url ||
      imageUrl
    ) {
      return;
    }

    // Mark as handled immediately to prevent duplicate requests
    hasHandledGenerationRef.current = true;

    // Use the generateImage function we defined above
    void generateImage(image.query);
  }, [image.query, image.url, imageUrl, slideIndex]);

  // Handle successful drops
  const onDragEnd = (item: DragItemNode, monitor: DragSourceMonitor) => {
    console.log(item, monitor.didDrop());
    const dropResult: { droppedInLayoutZone: boolean } =
      monitor.getDropResult()!;
    // Only remove if it was dropped (didDrop) but NOT in a layout zone
    if (monitor.didDrop() && !dropResult?.droppedInLayoutZone) {
      removeRootImageFromSlide();
    }
    editor.setOption(DndPlugin, "isDragging", false);
  };

  // Use the draggable hook
  const { isDragging, handleRef } = useDraggable({
    element: element,
    drag: {
      end: onDragEnd,
    },
  });

  // Function to remove the root image from the slide after successful drop
  const removeRootImageFromSlide = () => {
    const { slides } = usePresentationState.getState();
    const updatedSlides = slides.map((slide, index) => {
      if (
        index === slideIndex &&
        slide.rootImage &&
        [image.url, imageUrl].includes(slide.rootImage.url ?? "")
      ) {
        // Create a new slide object without the rootImage property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rootImage, ...rest } = slide;
        return rest;
      }
      return slide;
    });

    setSlides(updatedSlides);
    // Close popover if open
    setShowDeletePopover(false);
  };

  // Double-click handler for the image
  const handleImageDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSheetOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "flex-1 basis-[45%]",
          layoutType === "vertical" && "max-h-96 overflow-hidden"
        )}
      >
        <div
          className={cn(
            "h-full overflow-hidden border bg-background/80 shadow-md backdrop-blur-sm",
            isDragging && "opacity-50"
          )}
        >
          <div
            ref={handleRef}
            className="h-full cursor-grab active:cursor-grabbing"
          >
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4">
                <Spinner className="mb-2 h-8 w-8" />
                <p className="text-sm text-muted-foreground">
                  Generating image for &quot;{image.query}&quot;...
                </p>
              </div>
            ) : (
              <Popover
                open={showDeletePopover}
                onOpenChange={setShowDeletePopover}
              >
                <PopoverTrigger asChild>
                  <div
                    className="relative h-full"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeletePopover(true);
                    }}
                    onDoubleClick={handleImageDoubleClick}
                  >
                    {/*  eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl ?? image.url}
                      alt={image.query}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          e,
                          imageUrl ?? image.url
                        );
                        // Optionally set a fallback image or show an error state
                      }}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  side="top"
                  align="center"
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRootImageFromSlide();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

      {/* Image Editor Sheet */}
      <PresentationImageEditor
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        imageUrl={imageUrl ?? image.url}
        prompt={image.query}
        isGenerating={isGenerating}
        error={error}
        onRegenerateWithSamePrompt={() => {
          if (image.query) {
            void generateImage(image.query);
          }
        }}
        onGenerateWithNewPrompt={(newPrompt) => {
          void generateImage(newPrompt);
        }}
      />
    </>
  );
}
