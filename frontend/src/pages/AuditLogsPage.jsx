import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("All");
  useEffect(() => { api.analyticsAuditLogs().then((r) => setLogs(r.data)); }, []);
  const filtered = useMemo(() => logs.filter((l) => (action === "All" || l.action === action) && (!q || `${l.username} ${l.action} ${l.details || ""}`.toLowerCase().includes(q.toLowerCase()))), [logs, q, action]);
  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex flex-wrap gap-2">
          <input className="premium-input text-sm" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="premium-input text-sm" value={action} onChange={(e) => setAction(e.target.value)}>
            <option>All</option><option>create_user</option><option>update_user</option><option>delete_user</option><option>assign_doctor</option>
          </select>
          <button className="btn-secondary text-xs" onClick={() => api.analyticsClearLogs().then(() => api.analyticsAuditLogs().then((r) => setLogs(r.data)))}>Clear old logs</button>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400"><tr><th className="p-2">User</th><th className="p-2">Role</th><th className="p-2">Action</th><th className="p-2">Details</th><th className="p-2">Time</th></tr></thead>
            <tbody>{filtered.map((l) => <tr key={l.id} className="border-t border-slate-700/50"><td className="p-2">{l.username}</td><td className="p-2">{l.role}</td><td className="p-2">{l.action}</td><td className="p-2">{l.details || "-"}</td><td className="p-2">{new Date(l.created_at).toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
