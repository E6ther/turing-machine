import { useState } from "react";

interface VerifierPanelProps {
  displayOrder: number[][];
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function cardImgSrc(cardId: number): string {
  const n = String(cardId).padStart(2, "0");
  return `${import.meta.env.BASE_URL}images/criteriacards/TM_GameCards_CNS-${n}.png`;
}

export function VerifierPanel({ displayOrder }: VerifierPanelProps) {
  const [preview, setPreview] = useState<{ cardId: number; label: string } | null>(null);

  return (
    <>
      <div className={`grid gap-3 ${displayOrder[0]?.length > 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {displayOrder.map((group, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden transition-all"
          >
            <div className={`flex ${group.length > 1 ? "gap-3" : ""}`}>
              {group.map((cardId, j) => (
                <div key={j} className={`${group.length === 1 ? "w-full" : "min-w-0 flex-1"}`}>
                  <img
                    src={cardImgSrc(cardId)}
                    alt={`Card ${LETTERS[i]}${group.length > 1 ? `-${j}` : ""}`}
                    className="w-full h-auto block cursor-pointer hover:opacity-90 transition-opacity"
                    draggable={false}
                    onClick={() => setPreview({ cardId, label: LETTERS[i] })}
                  />
                </div>
              ))}
            </div>
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
              src={cardImgSrc(preview.cardId)}
              alt={`Card ${preview.label}`}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <div className="text-center mt-3 text-white text-sm font-bold">
              {preview.label}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
