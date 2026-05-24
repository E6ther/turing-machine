import type { Code, ApiResponse, Problem, ActiveVerifier } from "./types";
import { getLawFn } from "./lawMap";
import { getCard } from "./criteriaCards";
import { ALL_CODES } from "./constants";

export function resolveProblem(api: ApiResponse): Problem {
  const codes = parseCode(api.code);
  const verifiers: ActiveVerifier[] = api.ind.map((cardId, i) => {
    const lawId = api.law[i];
    const fn = getLawFn(lawId);
    const card = getCard(cardId);
    const desc =
      card?.candidates.find((c) => c.lawId === lawId)?.desc ?? "";
    return { cardId, lawId, desc, fn };
  });
  const mode = api.par ?? 0;
  return { secretCode: codes, verifiers, mode, fake: api.fake };
}

export function testProposal(
  proposal: Code,
  verifiers: ActiveVerifier[]
): boolean[] {
  return verifiers.map((v) => v.fn(proposal));
}

function parseCode(s: string): Code {
  const digits = String(s).split("").map(Number);
  if (digits.length !== 3 || digits.some((d) => d < 1 || d > 5))
    throw new Error(`Invalid code: ${s}`);
  return digits as Code;
}

export function findAllPassingCodes(
  verifiers: ActiveVerifier[]
): Code[] {
  return ALL_CODES.filter((code) =>
    verifiers.every((v) => v.fn(code))
  );
}
