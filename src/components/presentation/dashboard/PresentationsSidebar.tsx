"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { FileX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePresentationState } from "@/states/presentation-state";
import { useMutation } from "@tanstack/react-query";
import { PresentationItem } from "../PresentationItem";
import { type Prisma } from "@prisma/client";
import { SelectionControls } from "./SelectionControls";
import { deletePresentations } from "@/app/_actions/presentation/presentationActions";
import { fetchPresentations } from "@/app/_actions/presentation/fetchPresentations";

type PresentationDocument = Prisma.BaseDocumentGetPayload<{
  include: {
    presentation: true;
  };
}>;

interface PresentationResponse {
  items: PresentationDocument[];
  hasMore: boolean;
}

export function PresentationsSidebar() {
  const { ref: loadMoreRef, inView } = useInView();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    isSelecting,
    selectedPresentations,
    toggleSelecting,
    selectAllPresentations,
    deselectAllPresentations,
    togglePresentationSelection,
    isSheetOpen,
    setIsSheetOpen,
  } = usePresentationState();

  const handleCreateNew = () => {
    setIsSheetOpen(false);
  };

  const { mutate: deleteSelectedPresentations } = useMutation({
    mutationFn: async () => {
      const result = await deletePresentations(selectedPresentations);
      if (!result.success && !result.partialSuccess) {
        throw new Error(result.message ?? "Failed to delete presentations");
      }
      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["presentations-all"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-items"] });
      deselectAllPresentations();
      toggleSelecting();
      toast({
        title: "Success",
        description: result.message || "Selected presentations deleted",
      });
    },
    onError: (error) => {
      console.error("Failed to delete presentations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete presentations",
      });
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<PresentationResponse>({
    queryKey: ["presentations-all"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetchPresentations(pageParam as number);
      return response as PresentationResponse;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PresentationResponse, allPages) => {
      if (lastPage?.hasMore) {
        return allPages.length;
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPresentations = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSelectAll = () => {
    selectAllPresentations(
      allPresentations.map((presentation) => presentation.id)
    );
  };

  const sidebarContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-16 w-full" />
        </div>
      ));
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <FileX className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            Failed to load presentations
          </p>
        </div>
      );
    }

    if (allPresentations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <FileX className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            No presentations found
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4 p-0.5">
          {allPresentations.map((presentation) => (
            <PresentationItem
              key={presentation.id}
              presentation={presentation}
              isSelecting={isSelecting}
              onSelect={togglePresentationSelection}
              isSelected={selectedPresentations.includes(presentation.id)}
            />
          ))}
        </div>
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-8">
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        overlay={false}
        side="left"
        className="absolute flex h-full w-[400px] flex-col p-0"
        container={
          typeof document !== "undefined"
            ? document.querySelector<HTMLElement>(".notebook-section") ??
              undefined
            : undefined
        }
      >
        <div className="p-6">
          <SheetHeader className="space-y-4">
            <SheetTitle className="flex items-center justify-between">
              <span>Your Presentations</span>
            </SheetTitle>

            {!isSelecting && (
              <Button onClick={handleCreateNew} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Presentation
              </Button>
            )}
            <div className="flex items-center justify-end">
              <SelectionControls
                isSelecting={isSelecting}
                selectedCount={selectedPresentations.length}
                totalCount={allPresentations.length}
                onToggleSelecting={toggleSelecting}
                onSelectAll={handleSelectAll}
                onDeselectAll={deselectAllPresentations}
                onDelete={deleteSelectedPresentations}
              />
            </div>
          </SheetHeader>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto p-6 pt-0">
          {sidebarContent()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
