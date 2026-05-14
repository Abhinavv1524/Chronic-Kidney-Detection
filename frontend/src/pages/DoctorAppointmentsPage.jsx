import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function DoctorAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [noteById, setNoteById] = useState({});

  async function load() {
    const { data } = await api.myAppointments();
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "All") return items;
    return items.filter((x) => (x.status || "").toLowerCase() === statusFilter.toLowerCase());
  }, [items, statusFilter]);

  async function updateStatus(id, status) {
    await api.updateAppointmentStatus(id, { status, doctor_notes: noteById[id] || null });
    await load();
  }

  async function saveNote(id) {
    if (!noteById[id]) return;
    await api.addConsultationNote({ appointment_id: id, note: noteById[id] });
    setNoteById((prev) => ({ ...prev, [id]: "" }));
    await load();
  }

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Doctor Appointment Manager</h2>
          <select className="premium-input w-44 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option><option>pending</option><option>accepted</option><option>rejected</option><option>completed</option><option>cancelled</option>
          </select>
        </div>

        <div className="mt-3 space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="glass-soft rounded-2xl p-3 text-sm text-slate-200">
              <p className="font-medium">Appointment #{a.id}</p>
              <p className="text-xs text-slate-400">{new Date(a.appointment_date).toLocaleString()}</p>
              <p className="text-xs capitalize">Status: {a.status}</p>
              <p className="text-xs">{a.reason || "-"}</p>
              {a.doctor_notes && <p className="mt-1 rounded-lg bg-slate-900/50 p-2 text-xs text-cyan-200">Latest Note: {a.doctor_notes}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-primary text-xs disabled:opacity-40" disabled={(a.status || "").toLowerCase() !== "pending"} onClick={() => updateStatus(a.id, "accepted")}>Accept</button>
                <button className="btn-secondary text-xs disabled:opacity-40" disabled={(a.status || "").toLowerCase() !== "pending"} onClick={() => updateStatus(a.id, "rejected")}>Reject</button>
                <button className="btn-secondary text-xs disabled:opacity-40" disabled={(a.status || "").toLowerCase() !== "accepted"} onClick={() => updateStatus(a.id, "completed")}>Complete</button>
                <Link className="btn-secondary text-xs" to={`/doctor/patients/${a.patient_id}`}>View Patient</Link>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="premium-input text-xs"
                  placeholder="Consultation note"
                  value={noteById[a.id] || ""}
                  onChange={(e) => setNoteById({ ...noteById, [a.id]: e.target.value })}
                />
                <button className="btn-secondary text-xs" onClick={() => saveNote(a.id)}>Save Note</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-400">No appointments found.</p>}
        </div>
      </div>
    </Layout>
  );
}
