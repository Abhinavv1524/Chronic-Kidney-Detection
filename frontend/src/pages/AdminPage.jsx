import { Building2, Shield, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ full_name: "", email: "", username: "", password: "", role: "doctor" });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const [s, d] = await Promise.all([api.adminDashboard(), api.adminDoctorList()]);
    setSummary(s.data);
    setDoctors(d.data);
  }
  useEffect(() => { refresh(); }, []);

  async function createStaff() {
    setMsg("");
    await api.adminCreateStaff(form);
    setMsg("Staff account created.");
    setForm({ full_name: "", email: "", username: "", password: "", role: "doctor" });
    await refresh();
  }

  const statItems = [
    { icon: Users, label: "Users", value: summary?.total_users ?? "-" },
    { icon: UserCog, label: "Patients", value: summary?.total_patients ?? "-" },
    { icon: Building2, label: "Doctors", value: summary?.total_doctors ?? "-" },
    { icon: Shield, label: "Predictions", value: summary?.total_predictions ?? "-" },
  ];

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.label} className="glass lift rounded-2xl p-4">
            <item.icon size={16} className="text-blue-300" />
            <p className="mt-2 text-xs text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="glass glow-border rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Create Staff Account</h3>
          <div className="mt-3 grid gap-2">
            <input className="premium-input text-sm" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input className="premium-input text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="premium-input text-sm" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className="premium-input text-sm" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="premium-input text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn-primary text-sm" onClick={createStaff}>Create Staff</button>
            {msg && <p className="text-xs text-emerald-300">{msg}</p>}
          </div>
        </section>

        <section className="glass glow-border rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Doctor Directory</h3>
          <div className="mt-3 space-y-2">
            {doctors.map((d) => (
              <div key={d.id} className="glass-soft rounded-xl p-3 text-sm text-slate-200">
                <p className="font-medium text-slate-100">{d.full_name || d.username}</p>
                <p className="text-xs text-slate-400">{d.email}</p>
              </div>
            ))}
            {doctors.length === 0 && <p className="text-xs text-slate-400">No doctors yet.</p>}
          </div>
        </section>
      </div>
    </Layout>
  );
}
