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
  par: number;
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

interface PersistedState {
  lawIds: number[];
  records: TestRecord[];
  markers: Record<string, Mark>;
  phase: "idle" | "playing" | "solved" | "failed";
  gamePhase: "code-input" | "verifier-select";
  confirmedCode: Code | null;
  proposal: Code;
  selectedVerifierIndex: number | null;
  currentRound: number;
  mode: number;
  hash: string;
  par: number;
  secretCode?: Code;
  ind?: number[];
  fake?: number[];
}

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
      par: 0,
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
        par: p.par,
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
        return (
          code[0] === problem.secretCode[0] &&
          code[1] === problem.secretCode[1] &&
          code[2] === problem.secretCode[2]
        );
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
        par: 0,
        markers: {},
      }),
    }),
    {
      name: "turing-machine-game",
      partialize: (state) => ({
        lawIds: state.verifiers.map((v) => v.lawId),
        records: state.records,
        markers: state.markers,
        phase: state.phase,
        gamePhase: state.gamePhase,
        confirmedCode: state.confirmedCode,
        proposal: state.proposal,
        selectedVerifierIndex: state.selectedVerifierIndex,
        currentRound: state.currentRound,
        mode: state.mode,
        hash: state.hash,
        par: state.par,
        secretCode: state.problem?.secretCode,
        ind: state.problem?.ind,
        fake: state.problem?.fake,
      }),
      merge: (persisted, current) => {
        const p = persisted as unknown as PersistedState;
        const lawIds = p.lawIds ?? [];
        const verifiers = rebuildVerifiers(lawIds);
        const problem: Problem | null = p.secretCode
          ? { secretCode: p.secretCode, verifiers, ind: p.ind ?? [], mode: p.mode ?? 0, fake: p.fake, hash: p.hash ?? "", par: p.par ?? 0 }
          : null;
        return {
          ...current,
          problem,
          verifiers,
          displayOrder: problem ? buildDisplayOrder(problem.ind, problem.mode, problem.fake) : [],
          records: p.records ?? [],
          markers: p.markers ?? {},
          phase: p.phase ?? "idle",
          gamePhase: p.gamePhase ?? "code-input",
          confirmedCode: p.confirmedCode ?? null,
          proposal: p.proposal ?? [1, 1, 1],
          selectedVerifierIndex: p.selectedVerifierIndex ?? null,
          currentRound: p.currentRound ?? 1,
          mode: p.mode ?? 0,
          hash: p.hash ?? "",
          par: p.par ?? 0,
        };
      },
    },
  ),
);
