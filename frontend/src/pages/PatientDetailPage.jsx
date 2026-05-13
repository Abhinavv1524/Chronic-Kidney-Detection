import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  useEffect(() => { api.patientHistoryForDoctor(patientId).then((r) => setRecords(r.data)); }, [patientId]);

  const a = useMemo(() => records.find((x) => String(x.id) === compareA), [records, compareA]);
  const b = useMemo(() => records.find((x) => String(x.id) === compareB), [records, compareB]);

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <h2 className="text-lg font-semibold text-slate-100">Patient Detail #{patientId}</h2>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400"><tr><th className="p-2">Date</th><th className="p-2">Risk</th><th className="p-2">Probability</th><th className="p-2">Stage</th></tr></thead>
            <tbody>{records.map((r) => <tr key={r.id} className="border-t border-slate-700/50"><td className="p-2">{new Date(r.created_at).toLocaleString()}</td><td className="p-2">{r.risk_level}</td><td className="p-2">{r.binary_probability ? `${(r.binary_probability * 100).toFixed(1)}%` : "-"}</td><td className="p-2">{r.stage_prediction ?? "-"}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Assessment Comparison</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <select className="premium-input text-sm" value={compareA} onChange={(e) => setCompareA(e.target.value)}>
            <option value="">Select assessment A</option>{records.map((r) => <option key={r.id} value={r.id}>#{r.id} - {new Date(r.created_at).toLocaleDateString()}</option>)}
          </select>
          <select className="premium-input text-sm" value={compareB} onChange={(e) => setCompareB(e.target.value)}>
            <option value="">Select assessment B</option>{records.map((r) => <option key={r.id} value={r.id}>#{r.id} - {new Date(r.created_at).toLocaleDateString()}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 text-xs text-slate-200">
          <pre className="glass-soft rounded-xl p-2 overflow-auto">{a ? JSON.stringify(a, null, 2) : "No A selected"}</pre>
          <pre className="glass-soft rounded-xl p-2 overflow-auto">{b ? JSON.stringify(b, null, 2) : "No B selected"}</pre>
        </div>
      </div>
    </Layout>
  );
}
