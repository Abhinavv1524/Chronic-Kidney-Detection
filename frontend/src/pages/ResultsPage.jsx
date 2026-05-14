import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

const INPUT_FIELDS = [
  "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc", "ba", "bgr", "bu", "sc", "sod", "pot",
  "hemo", "pcv", "wbcc", "rbcc", "htn", "dm", "cad", "appet", "pe", "ane",
];

function riskTone(risk) {
  const key = (risk || "").toLowerCase();
  if (key === "high" || key === "critical") return "text-rose-300";
  if (key === "moderate") return "text-amber-300";
  return "text-emerald-300";
}

export default function ResultsPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [record, setRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [predictionMeta, setPredictionMeta] = useState(null);
  const [compare, setCompare] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const [current, list, dr] = await Promise.all([api.getRecord(id), api.listRecords(), api.listDoctors()]);
      setRecord(current.data);
      setAllRecords(list.data || []);
      setDoctors(dr.data || []);
      try {
        if (current.data?.prediction_result) setPredictionMeta(JSON.parse(current.data.prediction_result));
      } catch {
        setPredictionMeta(null);
      }
    }
    load();
  }, [id]);

  const probability = Math.round((record?.binary_probability || 0) * 100);
  const stage = record?.stage_prediction ?? "-";
  const risk = record?.risk_level || "Unknown";

  const featureRows = useMemo(() => {
    const src = predictionMeta?.feature_importance || {};
    return Object.entries(src).slice(0, 10).map(([name, value]) => ({ name, value: Number((value * 100).toFixed(2)) }));
  }, [predictionMeta]);

  const compareRecord = useMemo(() => allRecords.find((r) => String(r.id) === String(compare)), [allRecords, compare]);
  const recommendation = `CKD risk appears ${risk}. Maintain renal-safe hydration, controlled sodium intake, strict BP/sugar tracking, and timely nephrology follow-up.`;

  async function downloadPdf() {
    const payload = {
      patient_name: "Patient",
      age: record?.age || "",
      risk_level: risk,
      stage: stage,
      confidence: record?.confidence_score || "",
      recommendation,
      factors: featureRows.map((f) => `${f.name}: ${f.value}%`),
    };
    const { data } = await api.medicalPdf(payload);
    const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ckd_result_${record?.id || "report"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareWithDoctor() {
    await api.shareResult({ record_id: record?.id, doctor_id: doctors[0]?.doctor_id });
    setMsg("Shared with doctor successfully.");
  }

  if (!record) return <Layout><div className="glass rounded-3xl p-4 text-slate-200">Loading result...</div></Layout>;

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <section className="glass rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Risk Gauge</h2>
            <button className="btn-secondary text-xs" onClick={() => nav("/patient/records")}>Back to Records</button>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-900/40 p-4">
            <p className={`text-xl font-semibold ${riskTone(risk)}`}>{risk}</p>
            <p className="text-sm text-slate-300">Probability: {probability}%</p>
            <p className="text-sm text-slate-300">CKD Stage: {stage}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
              <div className={`h-full ${probability >= 70 ? "bg-rose-500" : probability >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${probability}%` }} />
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Feature Importance</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureRows} layout="vertical" margin={{ left: 20, right: 10 }}>
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={110} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {featureRows.map((_, i) => <Cell key={i} fill={i % 2 ? "#60a5fa" : "#22d3ee"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Input Summary & Recommendation</h3>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="text-slate-400"><tr><th className="p-2">Field</th><th className="p-2">Value</th></tr></thead>
              <tbody>
                {INPUT_FIELDS.map((f) => (
                  <tr key={f} className="border-t border-slate-700/50">
                    <td className="p-2 uppercase">{f}</td>
                    <td className="p-2">{record[f] ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 rounded-xl bg-slate-900/40 p-3 text-sm text-slate-200">{recommendation}</p>
        </section>

        <section className="glass rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Actions</h3>
          <div className="mt-3 grid gap-2">
            <button className="btn-primary text-sm" onClick={downloadPdf}>Download PDF</button>
            <button className="btn-secondary text-sm" onClick={shareWithDoctor}>Share with Doctor</button>
            <select className="premium-input text-sm" value={compare} onChange={(e) => setCompare(e.target.value)}>
              <option value="">Compare with previous result</option>
              {allRecords.filter((r) => r.id !== record.id).map((r) => (
                <option key={r.id} value={r.id}>{new Date(r.created_at).toLocaleString()} - {r.risk_level || "-"}</option>
              ))}
            </select>
            {compareRecord && (
              <div className="glass-soft rounded-xl p-3 text-xs text-slate-200">
                <p>Current: {probability}% ({risk})</p>
                <p>Previous: {Math.round((compareRecord.binary_probability || 0) * 100)}% ({compareRecord.risk_level || "-"})</p>
                <p>Stage: {stage} vs {compareRecord.stage_prediction ?? "-"}</p>
              </div>
            )}
            {msg && <p className="text-xs text-emerald-300">{msg}</p>}
          </div>
        </section>
      </div>
    </Layout>
  );
}
