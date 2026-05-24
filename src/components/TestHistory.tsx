import type { TestRecord } from "../core/types";
import { ColorShape } from "./ColorShape";

interface TestHistoryProps {
  records: TestRecord[];
  totalCards: number;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function TestHistory({ records, totalCards }: TestHistoryProps) {
  if (records.length === 0) return null;

  const rounds = new Map<number, TestRecord[]>();
  for (const r of records) {
    const list = rounds.get(r.round) ?? [];
    list.push(r);
    rounds.set(r.round, list);
  }
  const numCards = totalCards;
  const dashWidth = `${8 + 1.75 * numCards}rem`;

  return (
    <div>
      <h3 className="text-base font-bold mb-1 text-gray-500">历史记录</h3>
      <div className="overflow-y-auto">
        <div className="text-base font-mono leading-tight">
          <div className="flex items-center pt-1 pb-1.5 relative">
            <div className="w-7 flex-shrink-0" />
            <div className="w-7 flex-shrink-0 flex items-center justify-center"><ColorShape index={0} size={16} /></div>
            <div className="w-7 flex-shrink-0 flex items-center justify-center"><ColorShape index={1} size={16} /></div>
            <div className="w-7 flex-shrink-0 flex items-center justify-center"><ColorShape index={2} size={16} /></div>
            <div className="w-4 flex-shrink-0 text-center text-gray-300">|</div>
            {Array.from({ length: numCards }, (_, i) => (
              <div key={i} className="w-7 flex-shrink-0 text-center text-green-500 font-bold">{LETTERS[i]}</div>
            ))}
            <div className="absolute bottom-0 left-0 h-0 border-b-2 border-dashed border-gray-300 pointer-events-none"
              style={{ width: dashWidth }} />
          </div>
          {[...rounds.entries()].map(([round, roundRecords]) => {
            const code = roundRecords[0].proposal;
            const results = Array.from({ length: numCards }, (_, i) => {
              const r = roundRecords.find((rec) => rec.cardIndex === i);
              return r ? (r.result ? "✓" : "✗") : null;
            });
            const bgColors = ["bg-[#56b3dc]", "bg-[#febc11]", "bg-[#7f66ad]"];
            return (
              <div key={round} className="flex items-center pt-1 pb-1.5 relative">
                <div className="w-7 flex-shrink-0 text-center text-gray-400">#{round}</div>
                {code.map((d, i) => (
                  <div key={i} className="w-7 flex-shrink-0 text-center"><span className={`inline-block w-5 text-white font-bold rounded ${bgColors[i]}`}>{d}</span></div>
                ))}
                <div className="w-4 flex-shrink-0 text-center text-gray-300">|</div>
                {results.map((r, i) => (
                  <div key={i} className="w-7 flex-shrink-0 text-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 border border-gray-300 rounded align-middle font-bold ${r === null ? "" : r === "✓" ? "text-green-600" : "text-red-500"}`}>{r ?? ""}</span>
                  </div>
                ))}
                <div className="absolute bottom-0 left-0 h-0 border-b-2 border-dashed border-gray-300 pointer-events-none"
                  style={{ width: dashWidth }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
