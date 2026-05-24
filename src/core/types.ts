export type Code = [number, number, number];

export interface CriteriaCard {
  id: number;
  name: string;
  candidates: { lawId: number; desc: string }[];
}

export interface ActiveVerifier {
  lawId: number;
  fn: (code: Code) => boolean;
}

export interface ApiResponse {
  status: string;
  curDate: string;
  idPartie: number;
  color: number;
  hash: string;
  m: number | string;
  d: number;
  n: number | string;
  code: number;
  par: number;
  ind: number[];
  law: number[];
  crypt: number[];
  fake?: number[];
}

export interface Problem {
  secretCode: Code;
  verifiers: ActiveVerifier[];
  ind: number[];
  mode: number;
  fake?: number[];
  hash: string;
}

export interface TestRecord {
  round: number;
  proposal: Code;
  cardIndex: number;
  result: boolean;
}
