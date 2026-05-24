import { create } from "zustand";

interface NoteSheetState {
  expanded: boolean;
  toggle: () => void;
}

export const useNoteSheetStore = create<NoteSheetState>((set) => ({
  expanded: true,
  toggle: () => set((s) => ({ expanded: !s.expanded }),
  )}));
