import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function DoctorNotificationsPage() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("All");

  async function load() {
    const { data } = await api.notifications();
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (type === "All") return items;
    return items.filter((n) => (n.type || "").toLowerCase() === type.toLowerCase());
  }, [items, type]);

  async function onStatusFromText(n, status) {
    const match = String(n.message || "").match(/#(\d+)/);
    if (!match) return;
    await api.updateAppointmentStatus(Number(match[1]), { status });
    await api.markNotificationRead(n.id);
    await load();
  }

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Doctor Notifications</h2>
          <button className="btn-secondary text-xs" onClick={async () => { await api.markAllNotificationsRead(); await load(); }}>Mark all read</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", "appointment", "high-risk", "report", "system"].map((k) => (
            <button key={k} className={`btn-secondary text-xs ${type === k ? "ring-1 ring-cyan-400/40" : ""}`} onClick={() => setType(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="glass-soft rounded-xl p-3 text-sm text-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.is_read && <button className="btn-secondary text-[11px]" onClick={async () => { await api.markNotificationRead(n.id); await load(); }}>Read</button>}
                  <button className="btn-secondary text-[11px]" onClick={async () => { await api.deleteNotification(n.id); await load(); }}>Delete</button>
                </div>
              </div>
              {(n.type || "").toLowerCase() === "appointment" && (
                <div className="mt-2 flex gap-2">
                  <button className="btn-primary text-xs" onClick={() => onStatusFromText(n, "accepted")}>Accept</button>
                  <button className="btn-secondary text-xs" onClick={() => onStatusFromText(n, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-400">No notifications.</p>}
        </div>
      </div>
    </Layout>
  );
}
