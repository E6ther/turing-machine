import type { ApiResponse } from "./types";

export interface GameSettings {
  m: number;
  d: number;
  n: number;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = (b: number) => b.toString(16).padStart(2, "0");
      return (
        hex(bytes[0]) + hex(bytes[1]) + hex(bytes[2]) + hex(bytes[3]) + "-" +
        hex(bytes[4]) + hex(bytes[5]) + "-" +
        hex(bytes[6]) + hex(bytes[7]) + "-" +
        hex(bytes[8]) + hex(bytes[9]) + "-" +
        hex(bytes[10]) + hex(bytes[11]) + hex(bytes[12]) + hex(bytes[13]) + hex(bytes[14]) + hex(bytes[15])
      );
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function fetchRandomProblem(settings?: GameSettings): Promise<ApiResponse> {
  const uuid = generateUUID();
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

export async function fetchProblemByHash(hash: string): Promise<ApiResponse> {
  const uuid = generateUUID();
  const h = hash.replace(/^#/, "").trim();
  const res = await fetch(`/api/api.php?uuid=${uuid}&h=${encodeURIComponent(h)}`, {
    headers: {
      Referer: "https://turingmachine.info/",
      Origin: "https://turingmachine.info",
    },
  });
  const data: ApiResponse = await res.json();
  if (data.status !== "ok") throw new Error("API returned bad status");
  return data;
}
