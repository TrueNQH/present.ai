import { useState, useEffect, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ProseMirrorEditor from "@/components/prose-mirror/ProseMirrorEditor";

interface OutlineItemProps {
  id: string;
  index: number;
  title: string;
  onTitleChange: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

// Wrap the component with memo to prevent unnecessary re-renders
export const OutlineItem = memo(function OutlineItem({
  id,
  index,
  title,
  onTitleChange,
  onDelete,
}: OutlineItemProps) {
  // Always editable, no need for isEditing state
  const [editedTitle, setEditedTitle] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Update editedTitle when title prop changes
  useEffect(() => {
    setTimeout(() => {
      setEditedTitle(title);
    }, 0);
  }, [title]);

  const handleProseMirrorChange = (newContent: string) => {
    setEditedTitle(newContent);
  };

  const handleProseMirrorBlur = () => {
    if (editedTitle.trim() !== title) {
      onTitleChange(id, editedTitle);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-md bg-muted p-4",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={20} />
      </div>
      <span className="min-w-[1.5rem] text-indigo-400">{index}</span>
      <div className="flex-1">
        <ProseMirrorEditor
          content={editedTitle}
          onChange={handleProseMirrorChange}
          isEditing={true}
          onBlur={handleProseMirrorBlur}
          className="prose-headings:m-0 prose-headings:text-lg prose-headings:font-semibold prose-p:m-0 prose-ol:m-0 prose-ul:m-0 prose-li:m-0"
          showFloatingToolbar={false}
        />
      </div>
      <button
        onClick={() => onDelete(id)}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        <X size={20} />
      </button>
    </div>
  );
});

// Add a display name for debugging purposes
OutlineItem.displayName = "OutlineItem";
