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

const TARGET = "https://turingmachine.info/api/api.php";

const PROXY_LIST = [
  (u: string) => u,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.org/?${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

const headers = {
  Referer: "https://turingmachine.info/",
  Origin: "https://turingmachine.info",
};

async function tryFetch(url: string, timeoutMs: number): Promise<ApiResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
    const data: ApiResponse = JSON.parse(text);
    if (data.status !== "ok") throw new Error("API returned bad status");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchApi(params: string): Promise<ApiResponse> {
  const targetUrl = `${TARGET}?${params}`;

  if (!import.meta.env.PROD) {
    return tryFetch(`/api/api.php?${params}`, 10000);
  }

  const urls = PROXY_LIST.map((fn) => fn(targetUrl));
  const attempts: Promise<ApiResponse>[] = urls.map((url) =>
    tryFetch(url, 15000).then((data) => {
      console.log("[API] OK:", url.slice(0, 120));
      return data;
    })
  );
  try {
    return await Promise.any(attempts);
  } catch {
    throw new Error("所有请求方式均失败，可能是网络或CORS限制");
  }
}

export async function fetchRandomProblem(settings?: GameSettings): Promise<ApiResponse> {
  const uuid = generateUUID();
  const params = settings
    ? `uuid=${uuid}&m=${settings.m}&d=${settings.d}&n=${settings.n}`
    : `uuid=${uuid}&s=0`;
  return fetchApi(params);
}

export async function fetchProblemByHash(hash: string): Promise<ApiResponse> {
  const uuid = generateUUID();
  const h = hash.replace(/^#/, "").trim();
  return fetchApi(`uuid=${uuid}&h=${encodeURIComponent(h)}`);
}
