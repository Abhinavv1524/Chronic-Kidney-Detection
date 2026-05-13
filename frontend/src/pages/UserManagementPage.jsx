import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [form, setForm] = useState({ full_name: "", email: "", username: "", password: "", role: "patient" });

  async function load() {
    const { data } = await api.adminUsersAll();
    setUsers(data);
  }
  useEffect(() => { load(); }, []);

  async function createUser() {
    await api.adminUsersCreate(form);
    setForm({ full_name: "", email: "", username: "", password: "", role: "patient" });
    load();
  }
  async function remove(id) { await api.adminUsersDelete(id); load(); }

  const filtered = useMemo(() => users.filter((u) => {
    const r = role === "All" ? true : (u.role || "") === role.toLowerCase();
    const q = query ? `${u.full_name || ""} ${u.username || ""} ${u.email || ""}`.toLowerCase().includes(query.toLowerCase()) : true;
    return r && q;
  }), [users, query, role]);

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <h2 className="text-lg font-semibold text-slate-100">User Management</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="premium-input text-sm" placeholder="Search name/email/username" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="premium-input text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>All</option><option>Patient</option><option>Doctor</option><option>Admin</option>
          </select>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Actions</th></tr></thead>
            <tbody>{filtered.map((u) => <tr key={u.id} className="border-t border-slate-700/50"><td className="p-2">{u.full_name || u.username}</td><td className="p-2">{u.email}</td><td className="p-2 capitalize">{u.role}</td><td className="p-2"><button className="btn-secondary text-[11px]" onClick={() => remove(u.id)}>Delete</button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Add New User</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-5">
          <input className="premium-input text-sm" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className="premium-input text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="premium-input text-sm" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="premium-input text-sm" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="premium-input text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="patient">patient</option><option value="doctor">doctor</option><option value="admin">admin</option></select>
        </div>
        <button className="btn-primary mt-3 text-sm" onClick={createUser}>Create User</button>
      </div>
    </Layout>
  );
}
