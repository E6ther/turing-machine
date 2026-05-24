import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRandomProblem, fetchProblemByHash, type GameSettings } from "../core/apiScraper";
import { resolveProblem } from "../core/machine";
import { useGameStore } from "../store/gameStore";
import { useLayout } from "../hooks/useLayout";

const MODES = [
  { value: 0, label: "经典", desc: "无假验证器，标准游戏" },
  { value: 1, label: "极限", desc: "包含假验证器，需要识破诡计" },
  { value: 2, label: "噩梦", desc: "高难度组合，极具挑战" },
];

const DIFFICULTIES = [
  { value: 0, label: "简单" },
  { value: 1, label: "标准" },
  { value: 2, label: "困难" },
];

const VERIFIER_OPTIONS = [4, 5, 6];

function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; desc?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-500 mb-2">{label}</h2>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={
              `border-2 rounded-xl py-4 text-center transition-all ` +
              (value === opt.value
                ? "border-[#2db563] bg-[#e8f8ef] shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300")
            }
          >
            <div
              className={
                "font-bold text-sm " +
                (value === opt.value ? "text-[#2db563]" : "text-gray-700")
              }
            >
              {opt.label}
            </div>
            {opt.desc && <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Setup() {
  const navigate = useNavigate();
  const layout = useLayout();
  const setProblem = useGameStore((s) => s.setProblem);

  const [mode, setMode] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [verifierCount, setVerifierCount] = useState(4);
  const [searchHash, setSearchHash] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const settings: GameSettings = { m: mode, d: difficulty, n: verifierCount };
      const api = await fetchRandomProblem(settings);
      console.debug("[API 原始响应]", api);
      const problem = resolveProblem(api);
      console.debug("[解析后验证器]", problem.verifiers.map((v) => ({
        lawId: v.lawId,
      })));
      setProblem(problem);
      navigate("/game");
    } catch {
      alert("获取题目失败，请检查网络连接或调整设置");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByHash = async () => {
    const trimmed = searchHash.replace(/^#/, "").trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const api = await fetchProblemByHash(trimmed);
      const problem = resolveProblem(api);
      setProblem(problem);
      navigate("/game");
    } catch {
      alert("未找到该谜题，请检查 hash 是否正确");
    } finally {
      setLoading(false);
    }
  };

  const titleSize = layout.isMobile ? "text-3xl" : "text-4xl";
  const padding = layout.isMobile ? "p-4" : "p-6";

  return (
    <div className={`min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100 ${padding}`}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4"
        >
          &larr; 返回首页
        </button>

        <div className="space-y-6 text-center">
        <h1 className={`${titleSize} font-bold text-slate-800`}>游戏设置</h1>

        <OptionGroup
          label="游戏模式"
          options={MODES}
          value={mode}
          onChange={setMode}
        />

        <OptionGroup
          label="难度"
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
        />

        <div>
          <h2 className="text-sm font-bold text-slate-500 mb-2">验证者数量</h2>
          <div className="flex gap-2">
            {VERIFIER_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setVerifierCount(n)}
                className={
                  `flex-1 border-2 rounded-xl py-3 text-center font-bold text-lg transition-all ` +
                  (verifierCount === n
                    ? "border-[#2db563] bg-[#e8f8ef] text-[#2db563] shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300")
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className={
            "w-full py-4 rounded-xl text-lg font-bold text-white transition-all shadow-lg " +
            (loading
               ? "bg-[#7ed99e]"
              : "bg-[#2db563] hover:bg-[#259e56] active:bg-[#1e8849]")
          }
        >
          {loading ? "加载中..." : "开始游戏"}
        </button>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-bold text-slate-500 mb-2">搜索谜题</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="输入 hash，如 #B4D N5A"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#56b3dc] transition-colors"
            />
            <button
              onClick={handleSearchByHash}
              disabled={loading || !searchHash.trim()}
              className="px-4 py-3 bg-[#56b3dc] text-white rounded-xl font-bold text-sm hover:bg-[#4aa0c7] transition-colors disabled:opacity-50"
            >
              搜索
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}