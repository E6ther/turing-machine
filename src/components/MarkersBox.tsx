import { useState } from "react";
import { ColorShape } from "./ColorShape";

const DIGITS = [1, 2, 3, 4, 5];

type Mark = 0 | 1 | 2;

export function MarkersBox() {
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  const cycle = (col: number, d: number) => {
    const key = `${col}-${d}`;
    setMarks((prev) => {
      const cur = prev[key] ?? 0;
      const next = ((cur + 1) % 3) as Mark;
      if (next === 0) {
        const nextMap = { ...prev };
        delete nextMap[key];
        return nextMap;
      }
      return { ...prev, [key]: next };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="text-sm font-bold text-slate-500 mb-2 text-center">标记</div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-1">
        <div className="flex justify-center"><ColorShape index={0} size={24} /></div>
        <div className="flex justify-center"><ColorShape index={1} size={24} /></div>
        <div className="flex justify-center"><ColorShape index={2} size={24} /></div>
        {DIGITS.flatMap((d) => [0, 1, 2].map((col) => {
          const key = `${col}-${d}`;
          const mark = marks[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => cycle(col, d)}
              className="relative w-full h-10 flex items-center justify-center text-xl font-bold font-mono text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              {d}
              {mark === 1 && (
                <span className="absolute inset-0 flex items-center justify-center text-2xl text-green-500 font-bold">✓</span>
              )}
              {mark === 2 && (
                <span className="absolute inset-0 flex items-center justify-center text-2xl text-red-500 font-bold">✗</span>
              )}
            </button>
          );
        }))}
      </div>
    </div>
  );
}
