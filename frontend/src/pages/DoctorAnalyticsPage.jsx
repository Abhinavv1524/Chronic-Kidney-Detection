import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function DoctorAnalyticsPage() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.doctorPatients().then((r) => {
      setPatients(r.data || []);
      if (r.data?.[0]?.id) setSelected(String(r.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getPatientRecordsForDoctor(selected).then((r) => setRecords(r.data || [])).catch(() => setRecords([]));
  }, [selected]);

  const kpi = useMemo(() => {
    const total = records.length;
    const avg = total ? records.reduce((s, r) => s + (r.binary_probability || 0), 0) / total : 0;
    const high = records.filter((r) => ["high", "critical"].includes((r.risk_level || "").toLowerCase())).length;
    const latest = records[0]?.risk_level || "-";
    return { total, avg: Math.round(avg * 100), high, latest };
  }, [records]);

  const riskChart = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = r.risk_level || "Unknown";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([risk, count]) => ({ risk, count }));
  }, [records]);

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Doctor Analytics</h2>
          <select className="premium-input text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.username}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <div className="glass-soft rounded-xl p-3"><p className="text-xs text-slate-400">Assessments</p><p className="text-xl font-semibold text-slate-100">{kpi.total}</p></div>
          <div className="glass-soft rounded-xl p-3"><p className="text-xs text-slate-400">Average Probability</p><p className="text-xl font-semibold text-slate-100">{kpi.avg}%</p></div>
          <div className="glass-soft rounded-xl p-3"><p className="text-xs text-slate-400">High Risk Count</p><p className="text-xl font-semibold text-slate-100">{kpi.high}</p></div>
          <div className="glass-soft rounded-xl p-3"><p className="text-xs text-slate-400">Latest Risk</p><p className="text-xl font-semibold text-slate-100">{kpi.latest}</p></div>
        </div>
      </div>

      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Risk Distribution (Selected Patient)</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskChart}>
              <XAxis dataKey="risk" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {riskChart.map((_, i) => <Cell key={i} fill={["#22d3ee", "#60a5fa", "#f59e0b", "#ef4444"][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
