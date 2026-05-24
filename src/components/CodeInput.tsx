import { DIGITS } from "../core/constants";
import type { Code } from "../core/types";
import { ColorShape, SHAPE_COLORS } from "./ColorShape";

interface CodeInputProps {
  value: Code;
  onChange: (code: Code) => void;
  locked: boolean;
  submitMode?: boolean;
  onSubmitCode?: () => void;
  hideTitle?: boolean;
}

export function CodeInput({
  value,
  onChange,
  locked,
  submitMode,
  onSubmitCode,
  hideTitle,
}: CodeInputProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {!hideTitle && (
        <h2 className="text-lg font-bold">
          {submitMode ? "提交最终答案" : locked ? "本轮密码" : "选择密码"}
        </h2>
      )}
      <div className="flex flex-col gap-3">
        {value.map((digit, i) => (
          <div key={i} className="flex items-center gap-3">
            <ColorShape index={i} size={22} />
            <div className="flex gap-1">
              {DIGITS.map((d) => (
                <button
                  key={d}
                  disabled={locked}
                  onClick={() => {
                    const next: Code = [...value] as Code;
                    next[i] = d;
                    onChange(next);
                  }}
                  className={
                    `w-10 h-10 rounded text-lg font-bold transition-colors ` +
                    (digit === d
                      ? "text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700") +
                    (locked ? " opacity-50" : "")
                  }
                  style={digit === d ? { backgroundColor: SHAPE_COLORS[i] } : undefined}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {submitMode && onSubmitCode && (
        <button
          onClick={onSubmitCode}
          className="px-8 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
        >
          提交
        </button>
      )}
      {locked && !submitMode && (
        <span className="text-sm text-gray-400">已锁定</span>
      )}
    </div>
  );
}
