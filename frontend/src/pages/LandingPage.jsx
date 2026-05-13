import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="app-shell min-h-screen">
      <div className="aurora-bg" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-100">HFSA-CKD</h1>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <a href="#features">Features</a><a href="#how">How It Works</a><Link to="/about">About</Link>
            <Link to="/auth" className="btn-secondary">Login</Link><Link to="/auth" className="btn-primary">Register</Link>
          </div>
        </nav>
        <header className="mt-6 glass rounded-3xl p-8 text-center">
          <h2 className="text-4xl font-semibold text-white">Intelligent CKD Prediction & Clinical Decision Support</h2>
          <p className="mx-auto mt-3 max-w-3xl text-slate-300">AI-driven assessment, OCR automation, role-based dashboards for patient, doctor, and admin care workflows.</p>
          <div className="mt-5 flex justify-center gap-3"><Link to="/auth" className="btn-primary">Get Started</Link><a href="#features" className="btn-secondary">Learn More</a></div>
        </header>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["500+ patients assessed", "98% accuracy", "3 roles supported"].map((s) => <div key={s} className="glass-soft rounded-2xl p-3 text-center text-sm text-slate-200">{s}</div>)}
        </div>
        <section id="features" className="mt-6 grid gap-4 md:grid-cols-3">
          {["AI Prediction", "OCR Upload", "Multi-role System"].map((f) => <div key={f} className="glass-soft lift rounded-2xl p-4 text-slate-100">{f}</div>)}
        </section>
        <section id="how" className="mt-6 grid gap-4 md:grid-cols-3">
          {["Register", "Assess", "Get Results"].map((s, i) => <div key={s} className="glass-soft rounded-2xl p-4 text-slate-100">{i + 1}. {s}</div>)}
        </section>
        <section className="mt-6 flex flex-wrap gap-2">
          {["React", "FastAPI", "Python", "SQLite", "Tailwind"].map((t) => <span key={t} className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-200">{t}</span>)}
        </section>
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {["Developer", "Designer", "ML Engineer"].map((r, i) => <div key={r} className="glass-soft rounded-2xl p-4 text-sm text-slate-200">Member {i + 1} • {r}</div>)}
        </section>
        <footer className="mt-6 glass rounded-2xl px-4 py-3 text-xs text-slate-300">HFSA-CKD • GitHub • Institution • 2026</footer>
      </div>
    </div>
  );
}
