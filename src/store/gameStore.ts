import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Code, Problem, ActiveVerifier, TestRecord } from "../core/types";
import { getLawFn } from "../core/lawMap";

type Mark = 0 | 1 | 2;

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
  hash: string;
  markers: Record<string, Mark>;

  setProblem: (p: Problem) => void;
  setProposal: (code: Code) => void;
  confirmCode: () => void;
  selectVerifier: (index: number) => void;
  testVerifier: () => boolean | null;
  submitFinalAnswer: (code: Code) => boolean;
  backToCodeInput: () => void;
  nextRound: () => void;
  setMarkers: (markers: Record<string, Mark>) => void;
  cycleMarker: (col: number, d: number) => void;
  clearState: () => void;
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

function rebuildVerifiers(lawIds: number[]): ActiveVerifier[] {
  return lawIds.map((lawId) => ({ lawId, fn: getLawFn(lawId) }));
}

const persistStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (state) {
      const lawIds: number[] = state.verifiers ?? [];
      state.verifiers = rebuildVerifiers(lawIds);
      if (state.problem) {
        const plawIds: number[] = state.problem.verifiers ?? [];
        state.problem.verifiers = rebuildVerifiers(plawIds);
      }
      state.displayOrder = buildDisplayOrder(
        state.problem?.ind ?? [],
        state.mode ?? 0,
        state.problem?.fake,
      );
    }
    return parsed;
  },
  setItem: (name: string, value: unknown) => {
    const state = (value as Record<string, unknown>)?.state as Record<string, unknown> | undefined;
    if (state) {
      if (Array.isArray(state.verifiers)) {
        state.verifiers = (state.verifiers as ActiveVerifier[]).map((v) => v.lawId);
      }
      if (state.problem && typeof state.problem === "object") {
        const p = state.problem as Record<string, unknown>;
        if (Array.isArray(p.verifiers)) {
          p.verifiers = (p.verifiers as ActiveVerifier[]).map((v) => v.lawId);
        }
      }
      delete state.displayOrder;
    }
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
      hash: "",
      markers: {},

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
        hash: p.hash,
        markers: {},
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

      setMarkers: (markers) => set({ markers }),

      cycleMarker: (col, d) => {
        const key = `${col}-${d}`;
        set((s) => {
          const cur = s.markers[key] ?? 0;
          const next = ((cur + 1) % 3) as Mark;
          if (next === 0) {
            const nextMap = { ...s.markers };
            delete nextMap[key];
            return { markers: nextMap };
          }
          return { markers: { ...s.markers, [key]: next } };
        });
      },

      clearState: () => set({
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
        hash: "",
        markers: {},
      }),
    }),
    {
      name: "turing-machine-game",
      storage: persistStorage,
    },
  ),
);
