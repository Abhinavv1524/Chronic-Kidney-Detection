import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function PatientsListPage() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { api.doctorPatients().then((r) => setPatients(r.data)); }, []);
  const filtered = useMemo(() => patients.filter((p) => `${p.full_name || ""} ${p.username || ""}`.toLowerCase().includes(q.toLowerCase())), [patients, q]);
  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <h2 className="text-lg font-semibold text-slate-100">My Patients</h2>
        <input className="premium-input mt-3 text-sm" placeholder="Search patient..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400"><tr><th className="p-2">Name</th><th className="p-2">Username</th><th className="p-2">Email</th><th className="p-2">Actions</th></tr></thead>
            <tbody>{filtered.map((p) => <tr key={p.id} className="border-t border-slate-700/50"><td className="p-2">{p.full_name || "-"}</td><td className="p-2">{p.username}</td><td className="p-2">{p.email}</td><td className="p-2"><Link className="btn-secondary text-[11px]" to={`/doctor/patients/${p.id}`}>View</Link></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
