import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", email: "", username: "" });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [dangerConfirm, setDangerConfirm] = useState(false);

  async function load() {
    const { data } = await api.profile();
    setProfile({ full_name: data.full_name || "", email: data.email || "", username: data.username || "" });
  }
  useEffect(() => { load(); }, []);

  async function saveProfile() {
    setMsg("");
    await api.updateProfile(profile);
    setMsg("Profile updated.");
  }

  async function changePwd() {
    setMsg("");
    await api.changePassword(pwd);
    setPwd({ current_password: "", new_password: "" });
    setMsg("Password updated.");
  }

  async function deleteAccount() {
    await api.deleteAccount();
    window.location.href = "/auth";
  }

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="glass rounded-3xl p-4">
          <h2 className="text-lg font-semibold text-slate-100">Profile</h2>
          <div className="mt-3 grid gap-2">
            <input className="premium-input text-sm" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Full name" />
            <input className="premium-input text-sm" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
            <input className="premium-input text-sm" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="Username" />
            <button className="btn-primary text-sm" onClick={saveProfile}>Save Profile</button>
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h2 className="text-lg font-semibold text-slate-100">Change Password</h2>
          <div className="mt-3 grid gap-2">
            <input className="premium-input text-sm" type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} placeholder="Current password" />
            <input className="premium-input text-sm" type="password" value={pwd.new_password} onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })} placeholder="New password" />
            <button className="btn-primary text-sm" onClick={changePwd}>Update Password</button>
          </div>
        </section>
      </div>

      <section className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-rose-300">Danger Zone</h3>
        {!dangerConfirm ? (
          <button className="btn-secondary mt-2 text-xs" onClick={() => setDangerConfirm(true)}>Delete Account</button>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <button className="btn-primary text-xs" onClick={deleteAccount}>Confirm Delete</button>
            <button className="btn-secondary text-xs" onClick={() => setDangerConfirm(false)}>Cancel</button>
          </div>
        )}
        {msg && <p className="mt-2 text-xs text-emerald-300">{msg}</p>}
      </section>
    </Layout>
  );
}
