interface GameControlsProps {
  phase: "idle" | "playing" | "solved" | "failed";
  gamePhase: "code-input" | "verifier-select";
  canTest: boolean;
  canGoBack?: boolean;
  onConfirmCode: () => void;
  onTest: () => void;
  onNextRound: () => void;
  onBackToCodeInput?: () => void;
  onSubmitAnswer: () => void;
  onNewGame: () => void;
}

export function GameControls({
  phase,
  gamePhase,
  canTest,
  canGoBack,
  onConfirmCode,
  onTest,
  onNextRound,
  onBackToCodeInput,
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
          验证密码
        </button>
        <button
          onClick={onSubmitAnswer}
          className="px-6 py-3 bg-[#7f66ad] text-white rounded-lg font-bold hover:bg-[#6a58a0] transition-colors"
        >
          提交答案
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={canGoBack ? onBackToCodeInput : onNextRound}
        className="px-6 py-3 bg-[#56b3dc] text-white rounded-lg font-bold hover:bg-[#4a9ec4] transition-colors"
      >
        {canGoBack ? "返回" : "下一轮"}
      </button>
      <button
        onClick={onTest}
        disabled={!canTest}
        className={
          `px-6 py-3 rounded-lg font-bold transition-colors ` +
          (canTest
            ? "bg-yellow-400 text-white hover:bg-yellow-500"
            : "bg-gray-200 text-gray-400")
        }
      >
        测试
      </button>
      <button
        onClick={onSubmitAnswer}
        className="px-6 py-3 bg-[#7f66ad] text-white rounded-lg font-bold hover:bg-[#6a58a0] transition-colors"
      >
        提交答案
      </button>
    </div>
  );
}
