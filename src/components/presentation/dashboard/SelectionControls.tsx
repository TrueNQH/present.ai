import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Trash2, X } from "lucide-react";

interface SelectionControlsProps {
  isSelecting: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelecting: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
}

export function SelectionControls({
  isSelecting,
  selectedCount,
  totalCount,
  onToggleSelecting,
  onSelectAll,
  onDeselectAll,
  onDelete,
}: SelectionControlsProps) {
  if (!isSelecting) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelecting}
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        Select
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelecting}
        className="gap-2"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>

      {selectedCount > 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
          className="gap-2"
        >
          Deselect All ({selectedCount})
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="gap-2"
        >
          Select All ({totalCount})
        </Button>
      )}

      {selectedCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete ({selectedCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                {selectedCount} selected{" "}
                {selectedCount === 1 ? "item" : "items"}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
