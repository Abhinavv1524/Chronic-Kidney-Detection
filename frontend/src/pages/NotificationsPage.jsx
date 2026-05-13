import { useEffect, useMemo, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("Unread");

  async function load() {
    const { data } = await api.notifications();
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tab === "All" ? items : items.filter((x) => !x.is_read), [items, tab]);

  async function markRead(id) {
    await api.markNotificationRead(id);
    await load();
  }
  async function markAll() {
    await api.markAllNotificationsRead();
    await load();
  }
  async function remove(id) {
    await api.deleteNotification(id);
    await load();
  }

  return (
    <Layout>
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Notifications</h2>
          <button className="btn-secondary text-xs" onClick={markAll}>Mark all read</button>
        </div>
        <div className="mt-3 flex gap-2">
          <button className={`btn-secondary text-xs ${tab === "Unread" ? "ring-1 ring-cyan-400/40" : ""}`} onClick={() => setTab("Unread")}>Unread</button>
          <button className={`btn-secondary text-xs ${tab === "All" ? "ring-1 ring-cyan-400/40" : ""}`} onClick={() => setTab("All")}>All</button>
        </div>
        <div className="mt-3 space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="glass-soft rounded-xl p-3 text-sm text-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.is_read && <button className="btn-secondary text-[11px]" onClick={() => markRead(n.id)}>Read</button>}
                  <button className="btn-secondary text-[11px]" onClick={() => remove(n.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-400">No notifications.</p>}
        </div>
      </div>
    </Layout>
  );
}
