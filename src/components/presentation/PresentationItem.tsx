"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  EllipsisVertical,
  Star,
  Trash2,
  Pencil,
  Presentation,
  Copy,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { type BaseDocument } from "@prisma/client";
import { cn } from "@/lib/utils";

import { usePresentationState } from "@/states/presentation-state";
import {
  deletePresentations,
  duplicatePresentation,
  getPresentationContent,
  updatePresentationTitle,
} from "@/app/_actions/presentation/presentationActions";
import {
  addToFavorites,
  removeFromFavorites,
} from "@/app/_actions/presentation/toggleFavorite";

interface PresentationItemProps {
  presentation: BaseDocument & {
    presentation: {
      id: string;
      content: unknown;
      theme: string;
    } | null;
  };
  isFavorited?: boolean;
  isSelecting?: boolean;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export function PresentationItem({
  presentation,
  isFavorited = false,
  isSelecting = false,
  onSelect,
  isSelected = false,
  isLoading: initialLoading = false,
}: PresentationItemProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setCurrentPresentation = usePresentationState(
    (state) => state.setCurrentPresentation
  );

  const { mutate: deletePresentationMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: async () => {
        const result = await deletePresentations([presentation.id]);
        if (!result.success && !result.partialSuccess) {
          throw new Error(result.message ?? "Failed to delete presentation");
        }
        return result;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["presentations-all"],
        });
        await queryClient.invalidateQueries({ queryKey: ["recent-items"] });
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Presentation deleted successfully",
        });
      },
      onError: (error) => {
        console.error("Failed to delete presentation:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete presentation",
        });
      },
    });

  const { mutate: renameMutation, isPending: isRenaming } = useMutation({
    mutationFn: async () => {
      const newTitle = prompt("Enter new title", presentation.title || "");
      if (!newTitle) return null;

      const result = await updatePresentationTitle(presentation.id, newTitle);
      if (!result.success) {
        throw new Error(result.message ?? "Failed to rename presentation");
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["presentations-all"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-items"] });
      toast({
        title: "Success",
        description: "Presentation renamed successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to rename presentation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename presentation",
      });
    },
  });

  const { mutate: duplicateMutation, isPending: isDuplicating } = useMutation({
    mutationFn: async () => {
      const result = await duplicatePresentation(presentation.id);
      if (!result.success) {
        throw new Error(result.message ?? "Failed to duplicate presentation");
      }
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["presentations-all"] });
      toast({
        title: "Success",
        description: "Presentation duplicated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to duplicate presentation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate presentation",
      });
    },
  });

  const { mutate: favoriteMutation, isPending: isFavoritePending } =
    useMutation({
      mutationFn: async () => {
        if (isFavorited) {
          return removeFromFavorites(presentation.id);
        }
        return addToFavorites(presentation.id);
      },
      onSuccess: async (result) => {
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update favorites",
          });
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: ["documents", "favorites"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["presentations-all"],
        });

        toast({
          title: "Success",
          description: isFavorited
            ? "Presentation removed from favorites"
            : "Presentation added to favorites",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update favorites",
        });
      },
    });

  const handleClick = async (e: React.MouseEvent) => {
    if (isSelecting && onSelect) {
      e.preventDefault();
      onSelect(presentation.id);
      return;
    }

    try {
      setIsNavigating(true);
      setCurrentPresentation(presentation.id, presentation.title);

      // Check presentation status
      const response = await getPresentationContent(presentation.id);

      if (!response.success) {
        throw new Error(
          response.message ?? "Failed to check presentation status"
        );
      }

      console.log(response);
      // Route based on content status
      if (Object.keys(response?.presentation?.content ?? {}).length > 0) {
        router.push(`/presentation/${presentation.id}`);
      } else {
        router.push(`/presentation/generate/${presentation.id}`);
      }
    } catch (error) {
      console.error("Failed to navigate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open presentation",
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const isLoading = initialLoading || isNavigating;

  return (
    <>
      <div
        className={cn(
          "group relative flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-accent/5",
          isSelected && "ring-2 ring-primary",
          isLoading && "pointer-events-none opacity-70"
        )}
      >
        <div className="flex w-full items-center gap-3" onClick={handleClick}>
          {isSelecting ? (
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background"
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Presentation className="h-5 w-5 text-primary" />
              )}
            </div>
          )}
          <div>
            <h3 className="font-medium text-foreground">
              {isLoading ? "Loading..." : presentation.title || "Untitled"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading..."
                : new Date(presentation.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!isSelecting && (
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => renameMutation()}
                  disabled={isRenaming}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => duplicateMutation()}
                  disabled={isDuplicating}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => favoriteMutation()}
                  disabled={isFavoritePending}
                >
                  <Star
                    className={cn(
                      "mr-2 h-4 w-4",
                      isFavorited && "fill-primary"
                    )}
                  />
                  {isFavorited ? "Remove from favorites" : "Add to favorites"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePresentationMutation()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
