import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";

const TIPS = [
  "Drink water in spaced intervals; avoid sudden overhydration unless advised clinically.",
  "Prefer fresh home-cooked meals and reduce packaged high-sodium foods.",
  "Track BP weekly and maintain a written log for your doctor review.",
  "Do light daily activity like walking for 20-30 minutes if medically permitted.",
  "Limit painkiller self-medication; consult physician for renal-safe options.",
  "Sleep routine strongly impacts kidney and heart health. Keep regular timing.",
];

const STAGES = [
  { id: "G1", gfr: ">=90", summary: "Mild kidney damage with normal function." },
  { id: "G2", gfr: "60-89", summary: "Mild decline; monitor routinely." },
  { id: "G3", gfr: "30-59", summary: "Moderate decline; tighter management needed." },
  { id: "G4", gfr: "15-29", summary: "Severe decline; specialist follow-up is critical." },
  { id: "G5", gfr: "<15", summary: "Kidney failure; advanced renal care required." },
];

export default function EducationPage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [tip, setTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTip((prev) => {
        const next = TIPS[Math.floor(Math.random() * TIPS.length)];
        return next === prev ? TIPS[(TIPS.indexOf(next) + 1) % TIPS.length] : next;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const stage = useMemo(() => STAGES[stageIndex], [stageIndex]);

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="glass rounded-3xl p-4">
          <h2 className="text-lg font-semibold text-slate-100">What is CKD?</h2>
          <p className="mt-2 text-sm text-slate-300">
            Chronic Kidney Disease is a progressive reduction in kidney function. Early detection and lifestyle control can significantly slow progression.
          </p>
          <div className="mt-3 rounded-2xl bg-slate-900/45 p-3">
            <p className="text-xs uppercase text-cyan-300">Dynamic AI Health Tip</p>
            <p className="mt-1 text-sm text-slate-200">{tip}</p>
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">GFR Stage Explorer</h3>
          <input
            className="mt-3 w-full accent-cyan-400"
            type="range"
            min={0}
            max={STAGES.length - 1}
            value={stageIndex}
            onChange={(e) => setStageIndex(Number(e.target.value))}
          />
          <div className="mt-3 rounded-2xl bg-slate-900/45 p-3 text-sm text-slate-200">
            <p className="font-semibold text-cyan-300">{stage.id}</p>
            <p>GFR Range: {stage.gfr}</p>
            <p className="mt-1">{stage.summary}</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
