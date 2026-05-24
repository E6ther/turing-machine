import type { ApiResponse } from "./types";

export interface GameSettings {
  m: number;
  d: number;
  n: number;
}

export async function fetchRandomProblem(settings?: GameSettings): Promise<ApiResponse> {
  const uuid = crypto.randomUUID();
  const params = settings
    ? `uuid=${uuid}&m=${settings.m}&d=${settings.d}&n=${settings.n}`
    : `uuid=${uuid}&s=0`;
  const res = await fetch(`/api/api.php?${params}`, {
    headers: {
      Referer: "https://turingmachine.info/",
      Origin: "https://turingmachine.info",
    },
  });
  const data: ApiResponse = await res.json();
  if (data.status !== "ok") throw new Error("API returned bad status");
  return data;
}
