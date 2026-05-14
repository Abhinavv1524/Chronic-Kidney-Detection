import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

const CMP_FIELDS = ["risk_level", "binary_probability", "stage_prediction", "bp", "sc", "hemo", "bgr", "bu", "sod", "pot"];

function renderVal(record, key) {
  if (!record) return "-";
  if (key === "binary_probability") return `${Math.round((record.binary_probability || 0) * 100)}%`;
  return record[key] ?? "-";
}

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    async function load() {
      const [recRes, apptRes] = await Promise.all([api.patientHistoryForDoctor(patientId), api.myAppointments()]);
      setRecords(recRes.data || []);
      setAppointments((apptRes.data || []).filter((a) => String(a.patient_id) === String(patientId)));
    }
    load();
  }, [patientId]);

  const a = useMemo(() => records.find((x) => String(x.id) === compareA), [records, compareA]);
  const b = useMemo(() => records.find((x) => String(x.id) === compareB), [records, compareB]);

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Patient Detail #{patientId}</h2>
          <Link className="btn-secondary text-xs" to="/doctor/patients">Back to My Patients</Link>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400">
              <tr><th className="p-2">Date</th><th className="p-2">Risk</th><th className="p-2">Probability</th><th className="p-2">Stage</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-slate-700/50">
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2">{r.risk_level || "-"}</td>
                  <td className="p-2">{r.binary_probability ? `${(r.binary_probability * 100).toFixed(1)}%` : "-"}</td>
                  <td className="p-2">{r.stage_prediction ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Assessment Comparison</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <select className="premium-input text-sm" value={compareA} onChange={(e) => setCompareA(e.target.value)}>
            <option value="">Select assessment A</option>
            {records.map((r) => <option key={r.id} value={r.id}>#{r.id} - {new Date(r.created_at).toLocaleDateString()}</option>)}
          </select>
          <select className="premium-input text-sm" value={compareB} onChange={(e) => setCompareB(e.target.value)}>
            <option value="">Select assessment B</option>
            {records.map((r) => <option key={r.id} value={r.id}>#{r.id} - {new Date(r.created_at).toLocaleDateString()}</option>)}
          </select>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="text-slate-400">
              <tr><th className="p-2">Metric</th><th className="p-2">Assessment A</th><th className="p-2">Assessment B</th></tr>
            </thead>
            <tbody>
              {CMP_FIELDS.map((k) => (
                <tr key={k} className="border-t border-slate-700/50">
                  <td className="p-2 uppercase">{k}</td>
                  <td className="p-2">{renderVal(a, k)}</td>
                  <td className="p-2">{renderVal(b, k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass mt-4 rounded-3xl p-4">
        <h3 className="text-sm font-semibold text-slate-100">Consultation Notes & Appointment Trail</h3>
        <div className="mt-3 space-y-2">
          {appointments.map((a) => (
            <div key={a.id} className="glass-soft rounded-xl p-3 text-xs text-slate-200">
              <p>Appointment #{a.id} - {new Date(a.appointment_date).toLocaleString()}</p>
              <p className="capitalize">Status: {a.status}</p>
              <p>Reason: {a.reason || "-"}</p>
              <p>Doctor Notes: {a.doctor_notes || "No notes yet"}</p>
            </div>
          ))}
          {appointments.length === 0 && <p className="text-xs text-slate-400">No appointment trail found for this patient.</p>}
        </div>
      </div>
    </Layout>
  );
}
