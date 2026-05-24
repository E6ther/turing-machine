import type { TestRecord } from "../core/types";

interface TestHistoryProps {
  records: TestRecord[];
  cardsPerLetter: number;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function letterAt(pos: number, cardsPerLetter: number): string {
  return LETTERS[Math.floor(pos / cardsPerLetter)];
}

export function TestHistory({ records, cardsPerLetter }: TestHistoryProps) {
  if (records.length === 0) return null;

  const rounds = new Map<number, TestRecord[]>();
  for (const r of records) {
    const list = rounds.get(r.round) ?? [];
    list.push(r);
    rounds.set(r.round, list);
  }

  return (
    <div>
      <h3 className="text-sm font-bold mb-1 text-gray-500">历史记录</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {[...rounds.entries()].reverse().map(([round, roundRecords]) => {
          const code = roundRecords[0].proposal;
          const results = roundRecords.map(
            (r) => `${letterAt(r.cardIndex, cardsPerLetter)}${r.result ? "✓" : "✗"}`
          );
          return (
            <div key={round} className="text-xs font-mono">
              <span className="text-gray-400">#{round}</span>{" "}
              <span>{code.join("")}</span>{" "}
              <span className="text-gray-500">|</span>{" "}
              <span>{results.join(" ")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
