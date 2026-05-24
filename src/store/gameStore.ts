import { create } from "zustand";
import type { Code, Problem, ActiveVerifier, TestRecord } from "../core/types";

interface GameState {
  problem: Problem | null;
  verifiers: ActiveVerifier[];
  displayOrder: number[][];
  records: TestRecord[];
  proposal: Code;
  phase: "idle" | "playing" | "solved" | "failed";
  gamePhase: "code-input" | "verifier-select";
  confirmedCode: Code | null;
  selectedVerifierIndex: number | null;
  currentRound: number;
  mode: number;

  setProblem: (p: Problem) => void;
  setProposal: (code: Code) => void;
  confirmCode: () => void;
  selectVerifier: (index: number) => void;
  testVerifier: () => boolean | null;
  submitFinalAnswer: (code: Code) => boolean;
  backToCodeInput: () => void;
  nextRound: () => void;
}

function buildDisplayOrder(ind: number[], mode: number, fake?: number[]): number[][] {
  if (mode === 1 && fake) {
    return ind.map((id, i) => [id, fake[i]].sort((a, b) => a - b));
  }
  if (mode === 2) {
    return [...ind].sort((a, b) => a - b).map((id) => [id]);
  }
  return ind.map((id) => [id]);
}

export const useGameStore = create<GameState>((set, get) => ({
  problem: null,
  verifiers: [],
  displayOrder: [],
  records: [],
  proposal: [1, 1, 1],
  phase: "idle",
  gamePhase: "code-input",
  confirmedCode: null,
  selectedVerifierIndex: null,
  currentRound: 1,
  mode: 0,

  setProblem: (p) => set({
    problem: p,
    verifiers: p.verifiers,
    displayOrder: buildDisplayOrder(p.ind, p.mode, p.fake),
    records: [],
    proposal: [1, 1, 1],
    phase: "playing",
    gamePhase: "code-input",
    confirmedCode: null,
    selectedVerifierIndex: null,
    currentRound: 1,
    mode: p.mode,
  }),

  setProposal: (code) => set({ proposal: code }),

  confirmCode: () =>
    set((s) => ({
      confirmedCode: [...s.proposal] as Code,
      gamePhase: "verifier-select",
      selectedVerifierIndex: null,
    })),

  selectVerifier: (index) =>
    set((s) => ({
      selectedVerifierIndex: s.selectedVerifierIndex === index ? null : index,
    })),

  testVerifier: () => {
    const { confirmedCode, verifiers, selectedVerifierIndex, currentRound } = get();
    if (!confirmedCode || selectedVerifierIndex === null) return null;
    const result = verifiers[selectedVerifierIndex].fn(confirmedCode);
    const record: TestRecord = {
      round: currentRound,
      proposal: confirmedCode,
      cardIndex: selectedVerifierIndex,
      result,
    };
    set((s) => ({ records: [...s.records, record] }));
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
    set((s) => ({
      confirmedCode: null,
      gamePhase: "code-input",
      selectedVerifierIndex: null,
      currentRound: s.currentRound + 1,
    })),
}));
