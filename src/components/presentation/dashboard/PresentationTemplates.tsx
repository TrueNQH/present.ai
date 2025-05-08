import { Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PresentationTemplates() {
  const { showTemplates, setShowTemplates } = usePresentationState();

  return (
    <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-bold">Templates</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Coming Soon
          </h3>
          <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
            We&apos;re working on bringing you a collection of beautiful,
            professionally designed templates. Stay tuned!
          </p>
          <Button variant="outline" onClick={() => setShowTemplates(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
