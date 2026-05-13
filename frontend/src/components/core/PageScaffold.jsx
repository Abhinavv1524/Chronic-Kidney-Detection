export function PageScaffold({ title, subtitle, children }) {
  return (
    <div className="glass glow-border rounded-3xl p-5">
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </div>
  );
}

export function SectionCard({ title, children }) {
  return (
    <section className="glass-soft lift rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <div className="mt-2 text-sm text-slate-300">{children}</div>
    </section>
  );
}
