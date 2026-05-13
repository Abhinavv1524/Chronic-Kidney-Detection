import { CheckCircle2, ClipboardList, Eye, FileText, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function DoctorPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [history, setHistory] = useState([]);
  const [noteMap, setNoteMap] = useState({});

  async function refresh() {
    const { data } = await api.myAppointments();
    setAppointments(data);
  }
  useEffect(() => { refresh(); }, []);

  async function updateStatus(id, status) {
    await api.updateAppointmentStatus(id, { status });
    await refresh();
  }
  async function loadHistory(patientId) {
    setSelectedPatientId(patientId);
    const { data } = await api.patientHistoryForDoctor(patientId);
    setHistory(data);
  }
  async function addNote(appointmentId, patientId) {
    const note = noteMap[appointmentId];
    if (!note?.trim()) return;
    await api.addConsultationNote({ appointment_id: appointmentId, note });
    setNoteMap((prev) => ({ ...prev, [appointmentId]: "" }));
    await loadHistory(patientId);
  }

  return (
    <Layout>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <section className="glass glow-border rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Doctor Appointment Queue</h3>
          <div className="mt-3 space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="glass-soft lift rounded-2xl p-3 text-sm text-slate-200">
                <p className="text-xs text-slate-400">Appointment #{a.id}</p>
                <p className="mt-1">Patient ID: <span className="font-medium text-slate-100">{a.patient_id}</span></p>
                <p>Date: {new Date(a.appointment_date).toLocaleString()}</p>
                <p>Reason: {a.reason || "-"}</p>
                <p className="capitalize">Status: {a.status}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-secondary inline-flex items-center gap-1 text-xs" onClick={() => updateStatus(a.id, "accepted")}><CheckCircle2 size={13} /> Accept</button>
                  <button className="btn-secondary inline-flex items-center gap-1 text-xs" onClick={() => updateStatus(a.id, "rejected")}><XCircle size={13} /> Reject</button>
                  <button className="btn-secondary inline-flex items-center gap-1 text-xs" onClick={() => updateStatus(a.id, "completed")}><ClipboardList size={13} /> Complete</button>
                  <button className="btn-primary inline-flex items-center gap-1 text-xs" onClick={() => loadHistory(a.patient_id)}><Eye size={13} /> View History</button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input className="premium-input text-xs" value={noteMap[a.id] || ""} onChange={(e) => setNoteMap((prev) => ({ ...prev, [a.id]: e.target.value }))} placeholder="Consultation note..." />
                  <button className="btn-secondary text-xs" onClick={() => addNote(a.id, a.patient_id)}><FileText size={12} className="mr-1 inline" /> Save</button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <div className="glass-soft rounded-xl p-3 text-sm text-slate-400">No appointment requests yet.</div>}
          </div>
        </section>

        <section className="glass glow-border rounded-3xl p-4">
          <h3 className="text-sm font-semibold text-slate-100">Assigned Patient History</h3>
          <p className="mt-1 text-xs text-slate-400">Patient ID: {selectedPatientId || "-"}</p>
          <div className="mt-3 max-h-[620px] space-y-2 overflow-auto">
            {history.map((r) => (
              <div key={r.id} className="glass-soft rounded-xl p-2 text-xs text-slate-200">
                <p>Prediction: <span className="font-medium text-slate-100">{r.binary_prediction}</span></p>
                <p>Stage: {r.stage_prediction ?? "-"}</p>
                <p>Risk: {r.risk_level}</p>
                <p>Date: {new Date(r.created_at).toLocaleString()}</p>
              </div>
            ))}
            {history.length === 0 && <div className="glass-soft rounded-xl p-3 text-xs text-slate-400">Select appointment and click View History.</div>}
          </div>
        </section>
      </div>
    </Layout>
  );
}
