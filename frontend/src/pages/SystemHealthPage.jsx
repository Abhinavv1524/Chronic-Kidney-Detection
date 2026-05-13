import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [ping, setPing] = useState(null);
  useEffect(() => { api.analyticsHealth().then((r) => setHealth(r.data)); }, []);
  async function doPing() { const { data } = await api.analyticsPing(); setPing(data.timestamp); }
  return (
    <Layout>
      <div className="glass rounded-3xl p-4 text-sm text-slate-200">
        <p className="text-lg font-semibold text-slate-100">{health?.status || "Loading..."}</p>
        <p className="mt-2">Database: {String(health?.database_connected)}</p>
        <p>Model Loaded: {String(health?.model_loaded)}</p>
        <p>Uptime: {health?.uptime_hint || "-"}</p>
        <button className="btn-primary mt-3 text-sm" onClick={doPing}>Refresh Ping</button>
        {ping && <p className="mt-2 text-xs text-slate-400">Last ping: {new Date(ping).toLocaleString()}</p>}
      </div>
    </Layout>
  );
}
