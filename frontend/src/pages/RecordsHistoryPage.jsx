import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/core/Layout";
import { api, http } from "../services/api";

export default function RecordsHistoryPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function load() {
    const { data } = await api.listRecords();
    setRecords(data);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const byRisk = risk === "All" ? true : (r.risk_level || "").toLowerCase() === risk.toLowerCase();
      const bySearch = search
        ? `${r.risk_level || ""} ${r.stage_prediction || ""} ${r.created_at || ""}`.toLowerCase().includes(search.toLowerCase())
        : true;
      return byRisk && bySearch;
    });
  }, [records, search, risk]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  async function removeRecord(id) {
    await http.delete(`/api/records/${id}`);
    await load();
  }

  function exportCsv() {
    const rows = [["Date", "Risk", "Probability", "Stage"]];
    filtered.forEach((r) => rows.push([new Date(r.created_at).toLocaleString(), r.risk_level || "", r.binary_probability || "", r.stage_prediction || ""]));
    const csv = rows.map((x) => x.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "records.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">My Assessment History</h2>
          <button className="btn-secondary text-xs" onClick={exportCsv}>Export CSV</button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="premium-input text-sm" placeholder="Search date/risk/stage..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="premium-input text-sm" value={risk} onChange={(e) => { setRisk(e.target.value); setPage(1); }}>
            <option>All</option><option>Low</option><option>Moderate</option><option>High</option><option>Critical</option>
          </select>
          <div className="text-xs text-slate-400 self-center">Total records: {filtered.length}</div>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400">
              <tr><th className="p-2">Date</th><th className="p-2">Risk</th><th className="p-2">Probability</th><th className="p-2">Stage</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} className="border-t border-slate-700/50">
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2">{r.risk_level || "-"}</td>
                  <td className="p-2">{r.binary_probability ? `${(r.binary_probability * 100).toFixed(1)}%` : "-"}</td>
                  <td className="p-2">{r.stage_prediction ?? "-"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Link className="btn-secondary text-[11px]" to={`/patient/results/${r.id}`}>View</Link>
                      <button className="btn-secondary text-[11px]" onClick={() => removeRecord(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <p className="p-3 text-xs text-slate-400">No records found.</p>}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button className="btn-secondary text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="text-xs text-slate-400">Page {page} / {pages}</span>
          <button className="btn-secondary text-xs" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </Layout>
  );
}
