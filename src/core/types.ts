export type Code = [number, number, number];

export const Color = {
  Blue: 0,
  Yellow: 1,
  Purple: 2,
} as const;

export type Color = (typeof Color)[keyof typeof Color];

export const COLOR_LABELS: Record<Color, string> = {
  [Color.Blue]: "▲",
  [Color.Yellow]: "■",
  [Color.Purple]: "●",
};

export interface CriteriaCard {
  id: number;
  name: string;
  candidates: { lawId: number; desc: string }[];
}

export interface ActiveVerifier {
  cardId: number;
  lawId: number;
  desc: string;
  fn: (code: Code) => boolean;
}

export interface ApiResponse {
  status: string;
  code: string;
  n: number;
  ind: number[];
  law: number[];
  crypt?: number[];
  hash?: string;
  par?: number;
  fake?: number[];
}

export interface Problem {
  secretCode: Code;
  verifiers: ActiveVerifier[];
  mode: number;
  fake?: number[];
}

export interface TestRecord {
  round: number;
  proposal: Code;
  cardIndex: number;
  result: boolean;
}
