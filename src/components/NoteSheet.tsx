import { useNoteSheetStore } from "../store/noteSheetStore";

interface NoteSheetProps {
  compact?: boolean;
}

export function NoteSheet({ compact }: NoteSheetProps) {
  const expanded = useNoteSheetStore((s) => s.expanded);
  const toggle = useNoteSheetStore((s) => s.toggle);

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-bold text-sm">推理笔记</span>
        <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <textarea
          className={
            "w-full p-3 text-sm resize-none outline-none border-0 " +
            (compact ? "h-24" : "h-48")
          }
          placeholder="在此记录你的推理过程..."
        />
      )}
    </div>
  );
}