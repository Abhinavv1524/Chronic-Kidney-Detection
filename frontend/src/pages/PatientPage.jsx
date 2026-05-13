import { AlertTriangle, CalendarClock, CloudUpload, MessageCircleMore, ShieldPlus, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

const numericFields = [
  { key: "age", label: "Age", unit: "years" }, { key: "bp", label: "Blood Pressure", unit: "mmHg" },
  { key: "sg", label: "Specific Gravity", unit: "1.020" }, { key: "al", label: "Albumin", unit: "0-5" },
  { key: "su", label: "Sugar", unit: "0-5" }, { key: "bgr", label: "Blood Glucose", unit: "mg/dL" },
  { key: "bu", label: "Blood Urea", unit: "mg/dL" }, { key: "sc", label: "Serum Creatinine", unit: "mg/dL" },
  { key: "sod", label: "Sodium", unit: "mEq/L" }, { key: "pot", label: "Potassium", unit: "mEq/L" },
  { key: "hemo", label: "Hemoglobin", unit: "g/dL" }, { key: "pcv", label: "Packed Cell Volume", unit: "%" },
  { key: "wbcc", label: "WBC Count", unit: "/cumm" }, { key: "rbcc", label: "RBC Count", unit: "million/cumm" },
];
const categoricalFields = [
  { key: "rbc", label: "RBC", options: ["normal", "abnormal"] }, { key: "pc", label: "Pus Cell", options: ["normal", "abnormal"] },
  { key: "pcc", label: "Pus Cell Clumps", options: ["present", "notpresent"] }, { key: "ba", label: "Bacteria", options: ["present", "notpresent"] },
  { key: "htn", label: "Hypertension", options: ["yes", "no"] }, { key: "dm", label: "Diabetes", options: ["yes", "no"] },
  { key: "cad", label: "CAD", options: ["yes", "no"] }, { key: "appet", label: "Appetite", options: ["good", "poor"] },
  { key: "pe", label: "Pedal Edema", options: ["yes", "no"] }, { key: "ane", label: "Anemia", options: ["yes", "no"] },
];

const initialForm = [...numericFields, ...categoricalFields].reduce((a, f) => ({ ...a, [f.key]: "" }), {});

export default function PatientPage() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatQ, setChatQ] = useState("");
  const [chatA, setChatA] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({ doctor_id: "", appointment_date: "", reason: "" });

  const stepFields = { 1: ["age", "bp", "sg", "htn", "dm", "cad"], 2: ["bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wbcc", "rbcc"], 3: ["al", "su", "rbc", "pc", "pcc", "ba", "appet", "pe", "ane"] };
  const visibleNumeric = numericFields.filter((f) => stepFields[step].includes(f.key));
  const visibleCategorical = categoricalFields.filter((f) => stepFields[step].includes(f.key));
  const stepDone = stepFields[step].every((k) => `${form[k]}`.trim() !== "");
  const formReady = Object.values(form).every((v) => `${v}`.trim() !== "");

  async function refresh() {
    const [r, d, a] = await Promise.all([api.listRecords(), api.listDoctors(), api.myAppointments()]);
    setRecords(r.data);
    setDoctors(d.data);
    setAppointments(a.data);
  }
  useEffect(() => { refresh().catch(() => {}); }, []);

  async function runPredict() {
    if (!formReady) return setError("Fill all step fields to run prediction.");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.predictAndSave(form);
      setPrediction(data);
      refresh();
    } catch (e) {
      setError(e?.response?.data?.detail || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadPredict() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.uploadAndPredict(fd);
      setPrediction(data.prediction);
      refresh();
    } catch (e) {
      setError(e?.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function bookAppointment() {
    if (!appointmentForm.doctor_id || !appointmentForm.appointment_date) return setError("Select doctor and date/time.");
    await api.bookAppointment({
      doctor_id: Number(appointmentForm.doctor_id),
      appointment_date: new Date(appointmentForm.appointment_date).toISOString(),
      reason: appointmentForm.reason,
    });
    setAppointmentForm({ doctor_id: "", appointment_date: "", reason: "" });
    refresh();
  }

  const chartData = useMemo(() => records.slice(0, 8).reverse().map((r, i) => ({ i: i + 1, prob: Number((r.binary_probability || 0) * 100).toFixed(2) })), [records]);
  const latestRisk = prediction?.risk_level || records[0]?.risk_level || "Unknown";
  const latestProb = Math.round(((prediction?.binary_probability ?? records[0]?.binary_probability ?? 0) * 100));

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="glass glow-border rounded-3xl p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="glass-soft lift rounded-2xl p-3">
              <p className="text-xs text-slate-400">Latest Risk</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">{latestRisk}</p>
            </div>
            <div className="glass-soft lift rounded-2xl p-3">
              <p className="text-xs text-slate-400">CKD Probability</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">{latestProb}%</p>
            </div>
            <div className="glass-soft lift rounded-2xl p-3">
              <p className="text-xs text-slate-400">Appointments</p>
              <p className="mt-1 text-xl font-semibold text-slate-100">{appointments.length}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-900/40 p-3">
            <p className="text-sm font-semibold text-slate-100">AI Prediction Studio</p>
            <p className="text-xs text-slate-400">Step {step} of 3 • Guided CKD assessment flow</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {visibleNumeric.map((f) => (
                <label key={f.key}>
                  <span className="mb-1 block text-xs text-slate-300">{f.label}</span>
                  <input className="premium-input text-sm" type="number" step="any" placeholder={f.unit} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </label>
              ))}
              {visibleCategorical.map((f) => (
                <label key={f.key}>
                  <span className="mb-1 block text-xs text-slate-300">{f.label}</span>
                  <select className="premium-input text-sm" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    <option value="">Select</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {step > 1 && <button className="btn-secondary text-sm" onClick={() => setStep(step - 1)}>Back</button>}
              {step < 3 ? <button className="btn-primary text-sm" disabled={!stepDone} onClick={() => setStep(step + 1)}>Next</button> : <button className="btn-primary text-sm" disabled={loading || !formReady} onClick={runPredict}>{loading ? "Predicting..." : "Run Prediction"}</button>}
              <button className="btn-secondary text-sm" onClick={() => { setForm(initialForm); setStep(1); }}>Reset</button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
          </div>
        </section>

        <section className="glass glow-border rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">OCR Upload & AI Processing</h3>
          <div className="mt-3 rounded-2xl border border-dashed border-cyan-400/40 bg-slate-900/45 p-5 text-center">
            <CloudUpload className="mx-auto text-cyan-300" size={24} />
            <p className="mt-2 text-xs text-slate-300">Drop PDF/Image report or select file</p>
            <input className="mt-3 w-full text-xs text-slate-300" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="btn-primary mt-3 w-full text-sm" onClick={uploadPredict}>Process With AI</button>
          </div>
          <div className="mt-3 grid gap-2">
            <div className="glass-soft rounded-xl p-2 text-xs text-slate-300"><Sparkles size={12} className="mr-1 inline" /> Model: Hybrid FS + Ensemble Voting</div>
            <div className="glass-soft rounded-xl p-2 text-xs text-slate-300"><ShieldPlus size={12} className="mr-1 inline" /> Use outputs for clinical decision support.</div>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="glass rounded-3xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Risk Progression Analytics</h3>
            <span className="inline-flex items-center gap-1 text-xs text-cyan-300"><TrendingUp size={12} /> Live Trend</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <Tooltip />
                <Area type="monotone" dataKey="prob" stroke="#38bdf8" fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Doctor Appointments</h3>
          <div className="mt-3 grid gap-2">
            <select className="premium-input text-sm" value={appointmentForm.doctor_id} onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.full_name} {d.specialization ? `- ${d.specialization}` : ""}</option>)}
            </select>
            <input className="premium-input text-sm" type="datetime-local" value={appointmentForm.appointment_date} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })} />
            <input className="premium-input text-sm" placeholder="Reason (optional)" value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })} />
            <button className="btn-primary text-sm" onClick={bookAppointment}>Book Appointment</button>
            {doctors.length === 0 && <p className="rounded-xl bg-amber-400/10 p-2 text-xs text-amber-200"><AlertTriangle size={12} className="mr-1 inline" /> No doctors available yet.</p>}
          </div>
          <div className="mt-3 max-h-44 space-y-2 overflow-auto">
            {appointments.map((a) => (
              <div key={a.id} className="glass-soft rounded-xl p-2 text-xs text-slate-300">
                <p><CalendarClock size={12} className="mr-1 inline text-blue-300" /> {new Date(a.appointment_date).toLocaleString()}</p>
                <p className="capitalize">Status: {a.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">AI Assistant</h3>
        <div className="mt-2 flex gap-2">
          <input className="premium-input text-sm" value={chatQ} onChange={(e) => setChatQ(e.target.value)} placeholder="Ask CKD symptoms, prevention, diet..." />
          <button className="btn-primary inline-flex items-center gap-1 text-sm" onClick={async () => { const { data } = await api.chatbot(chatQ); setChatA(data.answer); }}><MessageCircleMore size={14} /> Ask</button>
        </div>
        {chatA && <p className="mt-2 rounded-xl bg-slate-900/40 p-3 text-sm text-slate-200">{chatA}</p>}
      </section>
    </Layout>
  );
}
