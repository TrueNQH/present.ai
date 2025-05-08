import { PresentationControls } from "../dashboard/PresentationControls";

export function Header() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-foreground">Prompt</span>
        <PresentationControls shouldShowLabel={false} />
      </div>
    </div>
  );
}
