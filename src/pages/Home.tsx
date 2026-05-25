import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../hooks/useLayout";

export function Home() {
  const navigate = useNavigate();
  const layout = useLayout();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("turing-machine-game");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.state?.phase === "playing") {
          navigate("/game", { replace: true });
        }
      }
    } catch {}
  }, [navigate]);

  return (
    <div
      className={
        "min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6 " +
        (layout.isPortrait ? "gap-6" : "gap-4")
      }
    >
      <h1
        className={
          "font-bold text-slate-800 " +
          (layout.isMobile ? "text-3xl" : "text-5xl")
        }
      >
        Turing Machine
      </h1>
      <p className="text-slate-500 text-center max-w-md">
        一款纯前端复刻的 Turing Machine 桌游推理游戏<br />
        通过验证器推断出正确的 3 位密码
      </p>
      <button
        onClick={() => navigate("/setup")}
        className="px-8 py-4 bg-[#2db563] text-white rounded-xl text-lg font-bold hover:bg-[#259e56] active:bg-[#1e8849] transition-colors shadow-lg"
      >
        开始新游戏
      </button>
      <a
        href={`${import.meta.env.BASE_URL}rules_CNS.pdf`}
        target="_blank"
        className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
      >
        规则说明
      </a>
    </div>
  );
}