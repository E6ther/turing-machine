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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function Game() {
  const navigate = useNavigate();
  const layout = useLayout();

  const problem = useGameStore((s) => s.problem);
  const verifiers = useGameStore((s) => s.verifiers);
  const records = useGameStore((s) => s.records);
  const proposal = useGameStore((s) => s.proposal);
  const phase = useGameStore((s) => s.phase);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const confirmedCode = useGameStore((s) => s.confirmedCode);
  const selectedVerifierIndex = useGameStore((s) => s.selectedVerifierIndex);
  const currentRound = useGameStore((s) => s.currentRound);
  const mode = useGameStore((s) => s.mode);
  const letterOrder = useGameStore((s) => s.letterOrder);
  const cardsPerLetter = useGameStore((s) => s.cardsPerLetter);
  const setProposal = useGameStore((s) => s.setProposal);
  const confirmCode = useGameStore((s) => s.confirmCode);
  const selectVerifier = useGameStore((s) => s.selectVerifier);
  const testVerifier = useGameStore((s) => s.testVerifier);
  const submitFinalAnswer = useGameStore((s) => s.submitFinalAnswer);
  const backToCodeInput = useGameStore((s) => s.backToCodeInput);
  const nextRound = useGameStore((s) => s.nextRound);
  const reset = useGameStore((s) => s.reset);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitCode, setSubmitCode] = useState<Code>([1, 1, 1]);

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

  const latestRecord =
    records.length > 0 ? records[records.length - 1] : null;

  const latestResultText =
    latestRecord &&
    latestRecord.round === currentRound &&
    `${LETTERS[Math.floor(latestRecord.cardIndex / cardsPerLetter)]} → ${
      latestRecord.result ? "✓" : "✗"
    }`;

  const testedCards = new Set(
    records.filter((r) => r.round === currentRound).map((r) => r.cardIndex)
  );

  const padding = layout.isMobile ? "p-3" : "p-4";

  return (
    <div className={`min-h-dvh bg-slate-50 ${padding}`}>
      <div className="max-w-lg mx-auto space-y-4">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          &larr; 返回首页
        </button>

        {phase !== "idle" && (
          <VerifierPanel verifiers={verifiers} letterOrder={letterOrder} />
        )}

        {phase === "playing" && gamePhase === "code-input" && (
          <CodeInput
            value={proposal}
            onChange={setProposal}
            locked={false}
          />
        )}

        {phase === "playing" && gamePhase === "verifier-select" && confirmedCode && (
          <div className="border rounded-xl bg-white p-4 space-y-3">
            <div className="text-center">
              <span className="text-sm font-bold text-gray-500">本轮密码</span>
              <div className="flex justify-center gap-4 mt-1">
                {confirmedCode.map((d, i) => (
                  <span key={i} className="flex flex-col items-center gap-1">
                    <ColorShape index={i} size={22} />
                    <span className="text-2xl font-bold text-gray-800">{d}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              {roundVerifyCount >= 3
                ? "本轮验证已达上限，请进行下一轮"
                : `本轮验证: ${roundVerifyCount}/3`}
            </div>

            {latestResultText && (
              <div className="text-center text-base font-bold text-gray-700">
                {latestResultText}
              </div>
            )}

            {roundVerifyCount === 0 && (
              <div className="text-center">
                <button
                  onClick={backToCodeInput}
                  className="text-sm text-[#2db563] hover:text-[#1e8849] transition-colors"
                >
                  &larr; 返回重新选择密码
                </button>
              </div>
            )}

            <div>
              <div className="text-center text-sm text-gray-500 mb-2">
                选择要测试的验证器
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: verifiers.length / cardsPerLetter }, (_, li) => {
                  const tested = cardsPerLetter > 1
                    ? Array.from({ length: cardsPerLetter }, (_, j) => testedCards.has(li * cardsPerLetter + j)).every(Boolean)
                    : testedCards.has(li);
                  const selected = cardsPerLetter > 1
                    ? Array.from({ length: cardsPerLetter }, (_, j) => selectedVerifierIndex === li * cardsPerLetter + j).some(Boolean)
                    : selectedVerifierIndex === li;
                  return (
                    <button
                      key={li}
                      disabled={tested || roundVerifyCount >= 3}
                      onClick={() => selectVerifier(li * cardsPerLetter)}
                      className={
                        `w-12 h-12 rounded-lg text-lg font-bold transition-colors ` +
                        (tested
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : selected
                            ? "bg-[#2db563] text-white shadow-sm"
                            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300")
                      }
                    >
                      {LETTERS[li]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {phase === "playing" && (
          <GameControls
            phase={phase}
            gamePhase={gamePhase}
            canTest={canTest}
            onConfirmCode={confirmCode}
            onTest={() => testVerifier()}
            onNextRound={nextRound}
            onSubmitAnswer={() => {
              setSubmitCode([1, 1, 1]);
              setShowSubmitModal(true);
            }}
            onReset={reset}
            onNewGame={() => navigate("/")}
          />
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
            onReset={reset}
            onNewGame={() => navigate("/")}
          />
        )}

        <TestHistory records={records} cardsPerLetter={cardsPerLetter} />
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-center">提交最终答案</h2>
            <CodeInput
              value={submitCode}
              onChange={setSubmitCode}
              locked={false}
              submitMode
              onSubmitCode={() => {
                submitFinalAnswer(submitCode);
                setShowSubmitModal(false);
              }}
            />
            <button
              onClick={() => setShowSubmitModal(false)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
