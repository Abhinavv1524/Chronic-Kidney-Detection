import { Calendar, FileText, Sparkles, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function PersonalizedDashboard() {
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    Promise.all([api.listRecords(), api.myAppointments(), api.patientDashboard()]).then(([r, a, d]) => {
      setRecords(r.data);
      setAppointments(a.data);
      setDashboard(d.data);
    });
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const latest = records[0];
  const prob = latest?.binary_probability ? `${(latest.binary_probability * 100).toFixed(1)}%` : "-";

  return (
    <Layout>
      <div className="glass rounded-3xl p-5">
        <h2 className="text-2xl font-semibold text-slate-100">{greeting}, {dashboard?.user?.name || "Patient"}</h2>
        <p className="text-sm text-slate-400">Welcome to your personalized CKD care dashboard.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="glass-soft rounded-2xl p-3"><p className="text-xs text-slate-400">Latest Risk</p><p className="mt-1 text-lg font-semibold text-slate-100">{latest?.risk_level || "-"}</p></div>
          <div className="glass-soft rounded-2xl p-3"><p className="text-xs text-slate-400">CKD Probability</p><p className="mt-1 text-lg font-semibold text-slate-100">{prob}</p></div>
          <div className="glass-soft rounded-2xl p-3"><p className="text-xs text-slate-400">GFR Stage</p><p className="mt-1 text-lg font-semibold text-slate-100">{latest?.stage_prediction ?? "-"}</p></div>
          <div className="glass-soft rounded-2xl p-3"><p className="text-xs text-slate-400">Appointments</p><p className="mt-1 text-lg font-semibold text-slate-100">{appointments.length}</p></div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Link to="/patient/assessment" className="glass-soft lift rounded-2xl p-4 text-sm text-slate-200"><Sparkles size={16} className="mb-2 text-cyan-300" />Start Assessment</Link>
        <Link to="/patient/appointments" className="glass-soft lift rounded-2xl p-4 text-sm text-slate-200"><Calendar size={16} className="mb-2 text-cyan-300" />Book Appointment</Link>
        <Link to="/patient/records" className="glass-soft lift rounded-2xl p-4 text-sm text-slate-200"><FileText size={16} className="mb-2 text-cyan-300" />View Records</Link>
        <Link to="/patient/assessment" className="glass-soft lift rounded-2xl p-4 text-sm text-slate-200"><UploadCloud size={16} className="mb-2 text-cyan-300" />Upload Report</Link>
      </div>
    </Layout>
  );
}
