import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ doctor_id: "", appointment_date: "", reason: "" });
  const [error, setError] = useState("");

  async function load() {
    const [d, a] = await Promise.all([api.listDoctors(), api.myAppointments()]);
    setDoctors(d.data);
    setAppointments(a.data);
  }
  useEffect(() => { load(); }, []);

  async function submit() {
    setError("");
    if (!form.doctor_id || !form.appointment_date) return setError("Doctor and date/time are required.");
    await api.bookAppointment({
      doctor_id: Number(form.doctor_id),
      appointment_date: new Date(form.appointment_date).toISOString(),
      reason: form.reason,
    });
    setForm({ doctor_id: "", appointment_date: "", reason: "" });
    await load();
  }

  async function cancel(id) {
    await api.cancelAppointment(id);
    await load();
  }

  const upcoming = useMemo(() => appointments.filter((a) => ["pending", "accepted", "confirmed"].includes((a.status || "").toLowerCase())), [appointments]);
  const past = useMemo(() => appointments.filter((a) => ["completed", "cancelled", "rejected"].includes((a.status || "").toLowerCase())), [appointments]);

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="glass rounded-3xl p-4">
          <h2 className="text-lg font-semibold text-slate-100">Book New Appointment</h2>
          <div className="mt-3 grid gap-2">
            <select className="premium-input text-sm" value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.full_name} {d.specialization ? `- ${d.specialization}` : ""}</option>)}
            </select>
            <input className="premium-input text-sm" type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
            <textarea className="premium-input text-sm" rows={3} placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button className="btn-primary text-sm" onClick={submit}>Submit</button>
            {error && <p className="text-xs text-rose-300">{error}</p>}
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h2 className="text-lg font-semibold text-slate-100">Upcoming Appointments</h2>
          <div className="mt-3 space-y-2">
            {upcoming.map((a) => (
              <div key={a.id} className="glass-soft rounded-xl p-3 text-sm text-slate-200">
                <p>{new Date(a.appointment_date).toLocaleString()}</p>
                <p className="capitalize">Status: {a.status}</p>
                <p>{a.reason || "-"}</p>
                <button className="btn-secondary mt-2 text-xs" onClick={() => cancel(a.id)}>Cancel</button>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-xs text-slate-400">No upcoming appointments.</p>}
          </div>
        </section>
      </div>

      <section className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Past Appointments</h3>
        <div className="mt-3 space-y-2">
          {past.map((a) => (
            <div key={a.id} className="glass-soft rounded-xl p-3 text-sm text-slate-200">
              <p>{new Date(a.appointment_date).toLocaleString()}</p>
              <p className="capitalize">Status: {a.status}</p>
              <p>{a.reason || "-"}</p>
            </div>
          ))}
          {past.length === 0 && <p className="text-xs text-slate-400">No past appointments.</p>}
        </div>
      </section>
    </Layout>
  );
}
