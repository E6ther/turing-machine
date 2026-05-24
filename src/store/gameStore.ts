import { create } from "zustand";
import type { Code, Problem, ActiveVerifier, TestRecord } from "../core/types";

interface GameState {
  problem: Problem | null;
  verifiers: ActiveVerifier[];
  records: TestRecord[];
  proposal: Code;
  phase: "idle" | "playing" | "solved" | "failed";
  gamePhase: "code-input" | "verifier-select";
  confirmedCode: Code | null;
  selectedVerifierIndex: number | null;
  currentRound: number;
  mode: number;
  /** Maps letter position → verifier index */
  letterOrder: number[];
  /** For extreme mode: how many cards per letter (2 for paired, 1 otherwise) */
  cardsPerLetter: number;

  setProblem: (p: Problem) => void;
  setProposal: (code: Code) => void;
  confirmCode: () => void;
  selectVerifier: (index: number) => void;
  testVerifier: () => boolean | null;
  submitFinalAnswer: (code: Code) => boolean;
  backToCodeInput: () => void;
  nextRound: () => void;
  reset: () => void;
}

function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildLetterOrder(mode: number, verifierCount: number): { letterOrder: number[]; cardsPerLetter: number } {
  if (mode === 2) {
    return { letterOrder: shuffledIndices(verifierCount), cardsPerLetter: 1 };
  }
  return { letterOrder: Array.from({ length: verifierCount }, (_, i) => i), cardsPerLetter: 1 };
}

export const useGameStore = create<GameState>((set, get) => ({
  problem: null,
  verifiers: [],
  records: [],
  proposal: [1, 1, 1],
  phase: "idle",
  gamePhase: "code-input",
  confirmedCode: null,
  selectedVerifierIndex: null,
  currentRound: 1,
  mode: 0,
  letterOrder: [],
  cardsPerLetter: 1,

  setProblem: (p) => {
    const { letterOrder, cardsPerLetter } = buildLetterOrder(p.mode, p.verifiers.length);
    return set({
      problem: p,
      verifiers: p.verifiers,
      records: [],
      proposal: [1, 1, 1],
      phase: "playing",
      gamePhase: "code-input",
      confirmedCode: null,
      selectedVerifierIndex: null,
      currentRound: 1,
      mode: p.mode,
      letterOrder,
      cardsPerLetter,
    });
  },

  setProposal: (code) => set({ proposal: code }),

  confirmCode: () =>
    set((s) => ({
      confirmedCode: [...s.proposal] as Code,
      gamePhase: "verifier-select",
      selectedVerifierIndex: null,
    })),

  selectVerifier: (baseIndex) =>
    set((s) => {
      const { cardsPerLetter, selectedVerifierIndex } = s;
      if (cardsPerLetter <= 1) {
        return { selectedVerifierIndex: selectedVerifierIndex === baseIndex ? null : baseIndex };
      }
      // Extreme mode: cycle through cards under the same letter
      const letterStart = baseIndex;
      if (selectedVerifierIndex === null || Math.floor(selectedVerifierIndex / cardsPerLetter) !== Math.floor(letterStart / cardsPerLetter)) {
        return { selectedVerifierIndex: letterStart };
      }
      const next = selectedVerifierIndex + 1;
      if (next >= letterStart + cardsPerLetter) {
        return { selectedVerifierIndex: null };
      }
      return { selectedVerifierIndex: next };
    }),

  testVerifier: () => {
    const { confirmedCode, verifiers, selectedVerifierIndex, currentRound, letterOrder } = get();
    if (!confirmedCode || selectedVerifierIndex === null) return null;
    const actualIndex = letterOrder[selectedVerifierIndex];
    const result = verifiers[actualIndex].fn(confirmedCode);
    const record: TestRecord = {
      round: currentRound,
      proposal: confirmedCode,
      cardIndex: selectedVerifierIndex,
      result,
    };
    set((s) => ({ records: [...s.records, record] }));
    console.debug("[测试]", {
      round: currentRound,
      proposal: confirmedCode,
      letter: selectedVerifierIndex,
      card: {
        index: actualIndex,
        cardId: verifiers[actualIndex].cardId,
        rule: verifiers[actualIndex].desc,
      },
      result,
    });
    return result;
  },

  submitFinalAnswer: (code) => {
    const { problem } = get();
    if (!problem) return false;
    const correct =
      code[0] === problem.secretCode[0] &&
      code[1] === problem.secretCode[1] &&
      code[2] === problem.secretCode[2];
    set({ phase: correct ? "solved" : "failed" });
    return correct;
  },

  backToCodeInput: () =>
    set({
      confirmedCode: null,
      gamePhase: "code-input",
      selectedVerifierIndex: null,
    }),

  nextRound: () =>
    set((s) => {
      const letterOrder = s.mode === 2 ? shuffledIndices(s.verifiers.length) : s.letterOrder;
      return {
        confirmedCode: null,
        gamePhase: "code-input",
        selectedVerifierIndex: null,
        currentRound: s.currentRound + 1,
        letterOrder,
      };
    }),

  reset: () =>
    set({
      problem: null,
      verifiers: [],
      records: [],
      proposal: [1, 1, 1],
      phase: "idle",
      gamePhase: "code-input",
      confirmedCode: null,
      selectedVerifierIndex: null,
      currentRound: 1,
      mode: 0,
      letterOrder: [],
      cardsPerLetter: 1,
    }),
}));
