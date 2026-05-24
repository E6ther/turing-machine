import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Code } from "../core/types";
import { useGameStore } from "../store/gameStore";
import { useLayout } from "../hooks/useLayout";
import { CodeInput } from "../components/CodeInput";
import { ColorShape } from "../components/ColorShape";
import { VerifierPanel } from "../components/VerifierPanel";
import { GameControls } from "../components/GameControls";
import { TestHistory } from "../components/TestHistory";
import { MarkersBox } from "../components/MarkersBox";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function Game() {
  const navigate = useNavigate();
  const layout = useLayout();

  const problem = useGameStore((s) => s.problem);
  const verifiers = useGameStore((s) => s.verifiers);
  const displayOrder = useGameStore((s) => s.displayOrder);
  const records = useGameStore((s) => s.records);
  const proposal = useGameStore((s) => s.proposal);
  const phase = useGameStore((s) => s.phase);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const confirmedCode = useGameStore((s) => s.confirmedCode);
  const selectedVerifierIndex = useGameStore((s) => s.selectedVerifierIndex);
  const currentRound = useGameStore((s) => s.currentRound);
  const setProposal = useGameStore((s) => s.setProposal);
  const confirmCode = useGameStore((s) => s.confirmCode);
  const selectVerifier = useGameStore((s) => s.selectVerifier);
  const testVerifier = useGameStore((s) => s.testVerifier);
  const submitFinalAnswer = useGameStore((s) => s.submitFinalAnswer);
  const backToCodeInput = useGameStore((s) => s.backToCodeInput);
  const nextRound = useGameStore((s) => s.nextRound);
  const hash = useGameStore((s) => s.hash);
  const par = useGameStore((s) => s.par);

  const [submitView, setSubmitView] = useState<"none" | "input" | "correct" | "incorrect" | "answer-revealed">("none");
  const [submitCode, setSubmitCode] = useState<Code>([1, 1, 1]);
  const [copied, setCopied] = useState(false);
  const [overlayCopied, setOverlayCopied] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const [showMarkersOverlay, setShowMarkersOverlay] = useState(false);

  useEffect(() => {
    if (!problem) navigate("/", { replace: true });
  }, [problem, navigate]);

  if (!problem) return null;

  const roundVerifyCount = records.filter(
    (r) => r.round === currentRound
  ).length;
  const canTest =
    gamePhase === "verifier-select" &&
    selectedVerifierIndex !== null &&
    roundVerifyCount < 3;

  const testedCards = new Set(
    records.filter((r) => r.round === currentRound).map((r) => r.cardIndex)
  );

  const roundRecords = records.filter((r) => r.round === currentRound);
  const testResults: (boolean | null)[] = verifiers.map((_, i) => {
    const r = roundRecords.find((rec) => rec.cardIndex === i);
    return r ? r.result : null;
  });

  const padding = layout.isMobile ? "p-3" : "p-4";

  const gameContent = (
    <>
      <button
        onClick={() => navigate("/")}
        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        &larr; 返回首页
      </button>

      {hash && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black font-mono text-slate-800 tracking-wider">#{hash}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`#${hash.replace(/\s+/g, "")}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            title="复制 hash"
          >
            <svg viewBox="0 0 1024 1024" className="w-4 h-4 inline-block mr-1 -mt-0.5 align-middle" fill={copied ? "#e6e6e6" : "currentColor"}><path d="M704 384v512H192V384h512m32-64h-576a32 32 0 0 0-32 32v576a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32v-576a32 32 0 0 0-32-32z"/><path d="M320 512m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z"/><path d="M320 704m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z"/><path d="M928 128h-576a32 32 0 0 0-32 32V256h64V192h512v576h-64v64h96a32 32 0 0 0 32-32v-640a32 32 0 0 0-32-32z"/></svg>
            {copied ? "已复制" : "分享"}
          </button>
        </div>
      )}

      {phase !== "idle" && (
        <VerifierPanel displayOrder={displayOrder} />
      )}
      {phase === "playing" && gamePhase === "code-input" && (
        <div className="border rounded-xl bg-white p-3 min-h-[17rem] flex flex-col sticky bottom-4 z-10 shadow-lg">
          <CodeInput
            value={proposal}
            onChange={setProposal}
            locked={false}
          />
          <div className="mt-auto">
            <GameControls
            phase={phase}
            gamePhase={gamePhase}
            canTest={canTest}
            onConfirmCode={confirmCode}
            onTest={() => testVerifier()}
            onNextRound={nextRound}
            onSubmitAnswer={() => {
              setSubmitCode([...proposal]);
              setSubmitView("input");
            }}
            onNewGame={() => navigate("/")}
          />
        </div>
        </div>
      )}

      {phase === "playing" && gamePhase === "verifier-select" && confirmedCode && (
        <div className="border rounded-xl bg-white p-3 min-h-[17rem] flex flex-col sticky bottom-4 z-10 shadow-lg">
          <div className="flex-1 space-y-3">
            <div className="border rounded-lg bg-gray-50 p-3">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-500 mb-1.5">本轮密码</div>
                <div className="flex items-center justify-center gap-4">
                  {confirmedCode.map((d, i) => (
                    <span key={i} className="flex flex-col items-center gap-0.5">
                      <ColorShape index={i} size={22} />
                      <span className="text-2xl font-bold text-gray-800 leading-none">{d}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">
                选择要测试的验证器
                <span className="ml-2 text-gray-400">
                  {roundVerifyCount >= 3 ? "已达上限" : `${roundVerifyCount}/3`}
                </span>
              </div>
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: verifiers.length }, (_, i) => {
                  const tested = testedCards.has(i);
                  const selected = selectedVerifierIndex === i;
                  const result = testResults[i];
                  const borderClass = tested
                    ? result ? "border-3 border-green-500" : "border-3 border-red-500"
                    : selected ? "" : "border-3 border-gray-200";
                  return (
                    <button
                      key={i}
                      disabled={tested || roundVerifyCount >= 3}
                      onClick={() => selectVerifier(i)}
                      className={
                        `w-10 h-10 rounded-lg text-base font-bold transition-colors ` +
                        (tested
                          ? "bg-gray-100 text-gray-300"
                          : selected
                            ? "bg-[#2db563] text-white shadow-sm"
                            : "bg-white text-gray-700 hover:border-gray-300") +
                        " " + borderClass
                      }
                    >
                      {LETTERS[i]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <GameControls
            phase={phase}
            gamePhase={gamePhase}
            canTest={canTest}
            canGoBack={gamePhase === "verifier-select" && roundVerifyCount === 0}
            onConfirmCode={confirmCode}
            onTest={() => testVerifier()}
            onNextRound={nextRound}
            onBackToCodeInput={backToCodeInput}
            onSubmitAnswer={() => {
              setSubmitCode([...proposal]);
              setSubmitView("input");
            }}
            onNewGame={() => navigate("/")}
          />
        </div>
      )}

        {(phase === "solved" || phase === "failed") && (
          <GameControls
            phase={phase}
            gamePhase={gamePhase}
            canTest={false}
            onConfirmCode={confirmCode}
            onTest={() => {}}
            onNextRound={nextRound}
            onSubmitAnswer={() => {}}
            onNewGame={() => navigate("/")}
          />
        )}

      {submitView !== "none" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">

            {submitView === "input" && (
              <>
                <h2 className="text-lg font-bold text-center">提交最终答案</h2>
                {hash && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black font-mono text-slate-800">#{hash}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`#${hash.replace(/\s+/g, "")}`);
                        setOverlayCopied(true);
                        setTimeout(() => setOverlayCopied(false), 2000);
                      }}
                      className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    >
                      {overlayCopied ? "已复制" : "分享"}
                    </button>
                  </div>
                )}
                <CodeInput
                  value={submitCode}
                  onChange={setSubmitCode}
                  locked={false}
                  hideTitle
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setSubmitView("none")}
                    className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      const correct = submitFinalAnswer(submitCode);
                      setSubmitView(correct ? "correct" : "incorrect");
                    }}
                    className="flex-1 py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
                  >
                    提交
                  </button>
                </div>
              </>
            )}

            {submitView === "correct" && (
              <div className="space-y-4 text-center">
                <div className="text-xl font-bold text-green-600">✅ 答案正确！</div>
                {hash && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black font-mono text-slate-800">#{hash}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`#${hash.replace(/\s+/g, "")}`);
                        setOverlayCopied(true);
                        setTimeout(() => setOverlayCopied(false), 2000);
                      }}
                      className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    >
                      {overlayCopied ? "已复制" : "分享"}
                    </button>
                  </div>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    你找出密码花费了<br />
                    <span className="font-bold">{new Set(records.map(r => r.round)).size} 轮</span>{" "}
                    <span className="font-bold">{records.length} 个问题</span>
                  </p>
                  <p>
                    图灵机花费了<br />
                    <span className="font-bold">{Math.ceil(par / 3)} 轮</span>{" "}
                    <span className="font-bold">{par} 个问题</span>
                  </p>
                </div>
                {(() => {
                  const playerRounds = new Set(records.map(r => r.round)).size;
                  const playerQuestions = records.length;
                  const tmRounds = Math.ceil(par / 3);
                  const won = playerRounds <= tmRounds && playerQuestions <= par;
                  return (
                    <div className={`rounded-lg py-3 px-4 font-bold ${won ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {won ? "恭喜你战胜了图灵机！" : "很抱歉你没有战胜图灵机"}
                    </div>
                  );
                })()}
                <button
                  onClick={() => {
                    useGameStore.setState({ phase: "solved" });
                    navigate("/");
                  }}
                  className="w-full py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
                >
                  回到主页
                </button>
              </div>
            )}

            {submitView === "incorrect" && (
              <div className="space-y-4 text-center">
                <div className="text-xl font-bold text-red-600">❌ 答案错误</div>
                {hash && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black font-mono text-slate-800">#{hash}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`#${hash.replace(/\s+/g, "")}`);
                        setOverlayCopied(true);
                        setTimeout(() => setOverlayCopied(false), 2000);
                      }}
                      className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    >
                      {overlayCopied ? "已复制" : "分享"}
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  密码不是{" "}
                  {submitCode.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 mx-0.5">
                      <ColorShape index={i} size={14} />
                      <span className="font-bold">{d}</span>
                    </span>
                  ))}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setSubmitView("none")}
                    className="px-6 py-3 bg-[#56b3dc] text-white rounded-lg font-bold hover:bg-[#4a9ec4] transition-colors"
                  >
                    继续
                  </button>
                  <button
                    onClick={() => setSubmitView("answer-revealed")}
                    className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
                  >
                    查看答案
                  </button>
                </div>
              </div>
            )}

            {submitView === "answer-revealed" && (
              <div className="space-y-4 text-center">
                <div className="text-xl font-bold text-red-600">❌ 答案错误</div>
                {hash && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-black font-mono text-slate-800">#{hash}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`#${hash.replace(/\s+/g, "")}`);
                        setOverlayCopied(true);
                        setTimeout(() => setOverlayCopied(false), 2000);
                      }}
                      className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    >
                      {overlayCopied ? "已复制" : "分享"}
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  密码不是{" "}
                  {submitCode.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 mx-0.5">
                      <ColorShape index={i} size={14} />
                      <span className="font-bold">{d}</span>
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-600">
                  正确密码:{" "}
                  {problem.secretCode.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 mx-0.5">
                      <ColorShape index={i} size={14} />
                      <span className="font-bold text-green-600">{d}</span>
                    </span>
                  ))}
                </p>
                <button
                  onClick={() => {
                    useGameStore.setState({ phase: "failed" });
                    navigate("/");
                  }}
                  className="w-full py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
                >
                  回到主页
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`min-h-dvh bg-slate-50 ${padding}`}>
      {layout.isMobile ? (
        <>
          <div className="max-w-lg mx-auto space-y-4">
            {gameContent}
          </div>
          <button
            onClick={() => setShowHistoryOverlay(true)}
            className={"fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#56b3dc] rounded-r-xl shadow-md w-6 py-3 flex flex-col items-center justify-center text-sm font-bold text-white transition-opacity cursor-pointer " + (showHistoryOverlay || showMarkersOverlay ? "opacity-0 pointer-events-none" : "")}
          >
            <span className="flex flex-col items-center gap-1">{"历史记录".split("").map((c, i) => <span key={i}>{c}</span>)}</span>
          </button>
          <button
            onClick={() => setShowMarkersOverlay(true)}
            className={"fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#febc11] rounded-l-xl shadow-md w-6 py-3 flex flex-col items-center justify-center text-sm font-bold text-white transition-opacity cursor-pointer " + (showHistoryOverlay || showMarkersOverlay ? "opacity-0 pointer-events-none" : "")}
          >
            <span className="flex flex-col items-center gap-1">{"标记".split("").map((c, i) => <span key={i}>{c}</span>)}</span>
          </button>
          <div className={"fixed inset-0 bg-black/50 z-50 flex items-center justify-start p-4 transition-opacity " + (showHistoryOverlay ? "" : "opacity-0 pointer-events-none")} onClick={() => setShowHistoryOverlay(false)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowHistoryOverlay(false)}
                className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm leading-none cursor-pointer"
              >
                ✕
              </button>
              <div className="bg-white rounded-xl p-4 max-h-[80vh] overflow-y-auto" style={{ width: "fit-content", minWidth: "300px" }}>
                <div className="text-sm font-bold text-slate-500 mb-2 text-center">历史记录</div>
                <TestHistory records={records} totalCards={verifiers.length} />
              </div>
            </div>
          </div>
          <div className={"fixed inset-0 bg-black/50 z-50 flex items-center justify-end p-4 transition-opacity " + (showMarkersOverlay ? "" : "opacity-0 pointer-events-none")} onClick={() => setShowMarkersOverlay(false)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMarkersOverlay(false)}
                className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm leading-none cursor-pointer"
              >
                ✕
              </button>
              <MarkersBox />
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-lg mx-auto relative">
          <div className="space-y-4">
            {gameContent}
          </div>
          <div className="fixed top-1/2 -translate-y-1/2" style={{ right: 'calc(50% + 16rem + 1rem)' }}>
            <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="text-sm font-bold text-slate-500 mb-1 text-center">历史记录</div>
              <TestHistory records={records} totalCards={verifiers.length} />
            </div>
          </div>
          <div className="fixed top-1/2 -translate-y-1/2" style={{ left: 'calc(50% + 16rem + 1rem)' }}>
            <MarkersBox />
          </div>
        </div>
      )}
    </div>
  );
}
