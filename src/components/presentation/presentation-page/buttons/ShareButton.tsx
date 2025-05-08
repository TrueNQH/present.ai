"use client";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ShareButton() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setIsShareDialogOpen(true)}
      >
        <Share className="mr-1 h-4 w-4" />
        Share
      </Button>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon</DialogTitle>
            <DialogDescription>
              The sharing functionality will be available soon. Stay tuned for
              updates!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
