import { useEffect, useState } from "react";
import Layout from "../components/core/Layout";
import { api } from "../services/api";

export default function ModelAnalyticsPage() {
  const [model, setModel] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [trend, setTrend] = useState([]);
  useEffect(() => {
    Promise.all([api.analyticsModel(), api.analyticsDataset(), api.analyticsPredictions()]).then(([m, d, t]) => {
      setModel(m.data); setDataset(d.data); setTrend(t.data);
    });
  }, []);
  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-4">
        {["accuracy", "precision", "recall", "f1_score"].map((k) => <div key={k} className="glass rounded-2xl p-3 text-sm text-slate-200">{k.toUpperCase()}: <b>{model ? `${(model[k] * 100).toFixed(1)}%` : "-"}</b></div>)}
      </div>
      <div className="glass mt-4 rounded-3xl p-4 text-sm text-slate-200">
        <p className="font-semibold">Confusion Matrix</p>
        <pre className="mt-2 text-xs">{JSON.stringify(model?.confusion_matrix || {}, null, 2)}</pre>
      </div>
      <div className="glass mt-4 rounded-3xl p-4 text-sm text-slate-200">
        <p className="font-semibold">Dataset Stats</p>
        <pre className="mt-2 text-xs">{JSON.stringify(dataset || {}, null, 2)}</pre>
      </div>
      <div className="glass mt-4 rounded-3xl p-4 text-sm text-slate-200">
        <p className="font-semibold">Prediction Trend</p>
        <pre className="mt-2 max-h-60 overflow-auto text-xs">{JSON.stringify(trend || [], null, 2)}</pre>
      </div>
    </Layout>
  );
}
