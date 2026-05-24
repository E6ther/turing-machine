import type { Code, ApiResponse, Problem } from "./types";
import { getLawFn } from "./lawMap";

export function resolveProblem(api: ApiResponse): Problem {
  return {
    secretCode: parseCode(String(api.code)),
    verifiers: api.law.map((lawId) => ({ lawId, fn: getLawFn(lawId) })),
    ind: api.ind,
    mode: Number(api.m),
    fake: api.fake,
  };
}

function parseCode(s: string): Code {
  const digits = s.split("").map(Number);
  if (digits.length !== 3 || digits.some((d) => d < 1 || d > 5))
    throw new Error(`Invalid code: ${s}`);
  return digits as Code;
}
