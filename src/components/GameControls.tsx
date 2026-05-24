interface GameControlsProps {
  phase: "idle" | "playing" | "solved" | "failed";
  gamePhase: "code-input" | "verifier-select";
  canTest: boolean;
  onConfirmCode: () => void;
  onTest: () => void;
  onNextRound: () => void;
  onSubmitAnswer: () => void;
  onNewGame: () => void;
}

export function GameControls({
  phase,
  gamePhase,
  canTest,
  onConfirmCode,
  onTest,
  onNextRound,
  onSubmitAnswer,
  onNewGame,
}: GameControlsProps) {
  if (phase === "idle") {
    return (
      <button
        onClick={onNewGame}
        className="w-full px-6 py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
      >
        开始新游戏
      </button>
    );
  }

  if (phase === "solved" || phase === "failed") {
    return (
      <div className="flex flex-col items-center gap-3">
        {phase === "solved" && (
          <div className="text-xl font-bold text-green-600">正确！</div>
        )}
        {phase === "failed" && (
          <div className="text-xl font-bold text-red-600">错误</div>
        )}
        <button
          onClick={onNewGame}
          className="px-6 py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
        >
          再来一局
        </button>
      </div>
    );
  }

  if (gamePhase === "code-input") {
    return (
      <div className="flex gap-3 justify-center">
        <button
          onClick={onConfirmCode}
          className="px-6 py-3 bg-[#2db563] text-white rounded-lg font-bold hover:bg-[#259e56] transition-colors"
        >
          确认密码
        </button>
        <button
          onClick={onSubmitAnswer}
          className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
        >
          提交答案
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={onNextRound}
        className="px-6 py-3 bg-[#56b3dc] text-white rounded-lg font-bold hover:bg-[#4a9ec4] transition-colors"
      >
        下一轮
      </button>
      <button
        onClick={onTest}
        disabled={!canTest}
        className={
          `px-6 py-3 rounded-lg font-bold transition-colors ` +
          (canTest
            ? "bg-[#2db563] text-white hover:bg-[#259e56]"
            : "bg-gray-200 text-gray-400")
        }
      >
        测试
      </button>
      <button
        onClick={onSubmitAnswer}
        className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
      >
        提交答案
      </button>
    </div>
  );
}
