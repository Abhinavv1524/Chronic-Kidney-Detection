import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function ReportsCenterPage() {
  const [form, setForm] = useState({ report_type: "Patient Summary", format: "PDF", from: "", to: "" });
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState({ enabled: false, frequency: "weekly", email: "" });

  async function load() { const { data } = await api.reportsList(); setItems(data); }
  useEffect(() => { load(); }, []);

  async function generate() {
    await api.reportsGenerate(form);
    load();
  }
  async function remove(id) { await api.reportsDelete(id); load(); }
  async function saveSchedule() { await api.reportsSchedule(schedule); }

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <h2 className="text-lg font-semibold text-slate-100">Generate New Report</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          <select className="premium-input text-sm" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}>
            <option>Patient Summary</option><option>Model Performance</option><option>Audit Summary</option>
          </select>
          <input className="premium-input text-sm" type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          <input className="premium-input text-sm" type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          <select className="premium-input text-sm" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}><option>PDF</option><option>CSV</option></select>
          <button className="btn-primary text-sm" onClick={generate}>Generate</button>
        </div>
      </div>
      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Download History</h3>
        <div className="mt-3 space-y-2">
          {items.map((r) => (
            <div key={r.id} className="glass-soft rounded-xl p-3 text-xs text-slate-200">
              <p>{r.report_name} • {r.report_type} • {r.report_format}</p>
              <p>{new Date(r.created_at).toLocaleString()} • by {r.generated_by}</p>
              <div className="mt-2 flex gap-2">
                <button className="btn-secondary text-[11px]" onClick={async () => alert(JSON.stringify((await api.reportsDownload(r.id)).data, null, 2))}>Download</button>
                <button className="btn-secondary text-[11px]" onClick={() => remove(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Scheduled Reports</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select className="premium-input text-sm" value={String(schedule.enabled)} onChange={(e) => setSchedule({ ...schedule, enabled: e.target.value === "true" })}><option value="false">Disabled</option><option value="true">Enabled</option></select>
          <select className="premium-input text-sm" value={schedule.frequency} onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}><option value="weekly">weekly</option><option value="monthly">monthly</option></select>
          <input className="premium-input text-sm" placeholder="email for delivery" value={schedule.email} onChange={(e) => setSchedule({ ...schedule, email: e.target.value })} />
        </div>
        <button className="btn-primary mt-3 text-sm" onClick={saveSchedule}>Save Schedule</button>
      </div>
    </Layout>
  );
}
