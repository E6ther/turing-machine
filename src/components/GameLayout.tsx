import type { ReactNode } from "react";
import type { LayoutInfo } from "../hooks/useLayout";

interface GameLayoutProps {
  layout: LayoutInfo;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  bottomPanel?: ReactNode;
}

export function GameLayout({ layout, leftPanel, rightPanel, bottomPanel }: GameLayoutProps) {
  if (layout.layoutMode === "side-by-side") {
    return (
      <div className="flex gap-4 h-full">
        <div className="w-[45%] min-w-0 space-y-4 overflow-y-auto">
          {leftPanel}
        </div>
        <div className="w-[55%] min-w-0 space-y-4 overflow-y-auto">
          {rightPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">{leftPanel}</div>
      <div className="space-y-4">{rightPanel}</div>
      {bottomPanel && <div>{bottomPanel}</div>}
    </div>
  );
}