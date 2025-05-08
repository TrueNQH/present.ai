import { useEffect, useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { OutlineItem } from "./OutlineItem";
import { Plus } from "lucide-react";
import { usePresentationState } from "@/states/presentation-state";
import { Skeleton } from "@/components/ui/skeleton";

interface OutlineItemType {
  id: string;
  title: string;
}

export function OutlineList() {
  const {
    outline: initialItems,
    setOutline,
    numSlides,
    isGeneratingOutline,
  } = usePresentationState();

  const [items, setItems] = useState<OutlineItemType[]>(
    initialItems.map((title, index) => ({
      id: (index + 1).toString(),
      title,
    })),
  );

  useEffect(() => {
    setItems(
      initialItems.map((title, index) => ({
        id: (index + 1).toString(),
        title,
      })),
    );
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update the outline in the store
        setOutline(newItems.map((item) => item.title));
        return newItems;
      });
    }
  }

  const handleTitleChange = (id: string, newTitle: string) => {
    setItems((items) => {
      const newItems = items.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item,
      );
      // Update the outline in the store
      setOutline(newItems.map((item) => item.title));
      return newItems;
    });
  };

  const handleAddCard = () => {
    const newId =
      items.length > 0
        ? (Math.max(...items.map((item) => parseInt(item.id))) + 1).toString()
        : "1";
    const newItems = [...items, { id: newId, title: "New Card" }];
    setItems(newItems);
    // Update the outline in the store
    setOutline(newItems.map((item) => item.title));
  };

  const handleDeleteCard = (id: string) => {
    setItems((items) => {
      const newItems = items.filter((item) => item.id !== id);
      // Update the outline in the store
      setOutline(newItems.map((item) => item.title));
      return newItems;
    });
  };

  const content = useMemo(() => {
    const totalSlides = numSlides;
    const loadedCount = items.length;
    const remainingCount = Math.max(0, totalSlides - loadedCount);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <OutlineItem
                key={item.id}
                id={item.id}
                index={index + 1}
                title={item.title}
                onTitleChange={handleTitleChange}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        </SortableContext>
        {isGeneratingOutline &&
          Array.from({ length: remainingCount }).map((_, index) => (
            <Skeleton key={`skeleton-${index}`} className="h-16 w-full" />
          ))}
      </DndContext>
    );
  }, [
    items,
    numSlides,
    isGeneratingOutline,
    sensors,
    handleDragEnd,
    handleTitleChange,
    handleDeleteCard,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-foreground">Outline</h2>
        {isGeneratingOutline && (
          <span className="animate-pulse text-xs text-muted-foreground">
            Generating outline...
          </span>
        )}
      </div>

      {content}

      <button
        onClick={handleAddCard}
        disabled={isGeneratingOutline}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-muted/50 py-3 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Plus size={20} />
        Add card
      </button>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{items.length} cards total</span>
        <span>
          {items.reduce((acc, item) => acc + item.title.length, 0)}/20000
        </span>
      </div>
    </div>
  );
}
