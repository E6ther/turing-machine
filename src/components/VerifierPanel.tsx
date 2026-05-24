import { useState } from "react";
import type { ActiveVerifier } from "../core/types";

interface VerifierPanelProps {
  verifiers: ActiveVerifier[];
  letterOrder: number[];
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function cardImgSrc(cardId: number): string {
  const n = String(cardId).padStart(2, "0");
  return `/images/criteriacards/TM_GameCards_CNS-${n}.png`;
}

export function VerifierPanel({ verifiers, letterOrder }: VerifierPanelProps) {
  const [preview, setPreview] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {letterOrder.map((vi, i) => (
          <div
            key={i}
            onClick={() => setPreview(i)}
            className="rounded-xl overflow-hidden ring-1 ring-gray-200 shadow-sm cursor-pointer hover:ring-gray-400 transition-all"
          >
            <img
              src={cardImgSrc(verifiers[vi].cardId)}
              alt={`Card ${LETTERS[i]}`}
              className="w-full h-auto block"
              draggable={false}
            />
            <div className="bg-[#2db563] text-white text-center text-sm font-bold py-0.5">
              {LETTERS[i]}
            </div>
          </div>
        ))}
      </div>

      {preview !== null && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={cardImgSrc(verifiers[letterOrder[preview]].cardId)}
              alt={`Card ${LETTERS[preview]}`}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <div className="text-center mt-3 text-white text-sm font-bold">
              {LETTERS[preview]}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
