import { Activity, Bot, BrainCircuit, HeartPulse, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", full_name: "", role: "patient" });
  const [resetEmail, setResetEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const nav = useNavigate();

  async function submitAuth(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (isLogin) await login(form.username, form.password);
      else await register(form);
      nav("/patient");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell min-h-screen">
      <div className="aurora-bg" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="glass glow-border relative hidden overflow-hidden rounded-3xl p-8 lg:block">
          <div className="absolute -right-12 top-12 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <p className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/50 px-3 py-1 text-xs text-cyan-200">
            <Activity size={13} />
            AI-Powered Renal Intelligence
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white">
            Premium CKD Decision Support For Modern Clinical Teams
          </h1>
          <p className="mt-4 max-w-lg text-sm text-slate-300">
            Early-stage prediction, explainable risk insights, doctor-patient workflows, and outcome-focused healthcare orchestration.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: BrainCircuit, t: "AI Risk Engine", s: "Ensemble + stage-aware scoring" },
              { icon: Bot, t: "Smart Assistant", s: "Clinical Q&A and care prompts" },
              { icon: HeartPulse, t: "Patient Monitoring", s: "Timeline and trend intelligence" },
              { icon: ShieldCheck, t: "Secure Roles", s: "Patient/Doctor/Admin governance" },
            ].map((item) => (
              <div key={item.t} className="glass-soft lift rounded-2xl p-3">
                <item.icon size={16} className="text-blue-300" />
                <p className="mt-2 text-sm font-medium text-slate-100">{item.t}</p>
                <p className="mt-1 text-xs text-slate-400">{item.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass glow-border flex items-center rounded-3xl p-6">
          <div className="w-full">
            <p className="text-xs uppercase tracking-wide text-blue-300">HFSA-CKD Access</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-400">Secure sign-in for patients and doctors.</p>

            <div className="mt-5 inline-flex rounded-2xl border border-slate-600 bg-slate-900/40 p-1 text-sm">
              <button type="button" onClick={() => setIsLogin(true)} className={`rounded-xl px-3 py-1.5 ${isLogin ? "bg-indigo-600 text-white" : "text-slate-300"}`}>Login</button>
              <button type="button" onClick={() => setIsLogin(false)} className={`rounded-xl px-3 py-1.5 ${!isLogin ? "bg-indigo-600 text-white" : "text-slate-300"}`}>Register</button>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={submitAuth}>
              {!isLogin && <input className="premium-input" placeholder="Full Name" onChange={(e) => setForm({ ...form, full_name: e.target.value })} />}
              {!isLogin && <input className="premium-input" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />}
              <input className="premium-input" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <input type="password" className="premium-input" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {!isLogin && (
                <select className="premium-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="patient">Patient Account</option>
                  <option value="doctor">Doctor Account</option>
                </select>
              )}
              <button className="btn-primary" disabled={busy}>{busy ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</button>
            </form>

            <div className="mt-3 flex items-center justify-between text-sm">
              <button type="button" className="text-blue-300 hover:text-blue-200" onClick={() => setShowRecovery(true)}>Forgot password?</button>
              {message && <span className="text-rose-300">{message}</span>}
            </div>
          </div>
        </section>
      </div>

      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="glass glow-border w-full max-w-md rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">Password Recovery</h3>
            <div className="mt-3 grid gap-2">
              <input className="premium-input" placeholder="Account Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  const { data } = await api.forgotPassword(resetEmail);
                  setMessage(data.reset_token ? `Reset token: ${data.reset_token}` : data.message);
                }}
              >
                Generate Reset Token
              </button>
              <input className="premium-input" placeholder="Reset Token" value={token} onChange={(e) => setToken(e.target.value)} />
              <input type="password" className="premium-input" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={async () => {
                    await api.resetPassword(token, newPassword);
                    setMessage("Password reset completed");
                    setShowRecovery(false);
                  }}
                >
                  Reset Password
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowRecovery(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
