import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="aurora-bg" />
      <div className="glass rounded-3xl p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-cyan-300" />
        <h1 className="mt-3 text-4xl font-semibold text-white">404</h1>
        <p className="mt-1 text-slate-300">Page not found</p>
        <p className="text-sm text-slate-400">The page you are looking for doesn't exist or has been moved.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn-primary" onClick={() => nav("/")}>Go Home</button>
          <button className="btn-secondary" onClick={() => nav(-1)}>Go Back</button>
        </div>
      </div>
    </div>
  );
}
