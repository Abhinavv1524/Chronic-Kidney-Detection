import { Activity, CalendarCheck2, LayoutDashboard, LogOut, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleConfig = {
  patient: {
    title: "Patient Intelligence Hub",
    links: [
      { to: "/patient", label: "Dashboard", icon: LayoutDashboard },
      { to: "/patient/assessment", label: "AI Assessment", icon: Sparkles },
      { to: "/patient/records", label: "My Records", icon: CalendarCheck2 },
      { to: "/patient/appointments", label: "Appointments", icon: CalendarCheck2 },
      { to: "/patient/notifications", label: "Notifications", icon: Activity },
      { to: "/patient/education", label: "CKD Education", icon: Stethoscope },
      { to: "/patient/settings", label: "Profile & Settings", icon: ShieldCheck },
    ],
  },
  doctor: {
    title: "Doctor Command Center",
    links: [
      { to: "/doctor", label: "My Dashboard", icon: LayoutDashboard },
      { to: "/doctor/patients", label: "My Patients", icon: Stethoscope },
      { to: "/doctor/appointments", label: "Appointments", icon: CalendarCheck2 },
      { to: "/doctor/analytics", label: "Analytics", icon: Activity },
      { to: "/doctor/notifications", label: "Notifications", icon: ShieldCheck },
      { to: "/doctor/settings", label: "Settings", icon: ShieldCheck },
    ],
  },
  admin: {
    title: "Admin Operations",
    links: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/users", label: "User Management", icon: Stethoscope },
      { to: "/admin/model", label: "Model Analytics", icon: Activity },
      { to: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
      { to: "/admin/health", label: "System Health", icon: Activity },
      { to: "/admin/reports", label: "Reports Center", icon: CalendarCheck2 },
      { to: "/admin/settings", label: "Settings", icon: ShieldCheck },
    ],
  },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const role = user?.role || "patient";
  const config = roleConfig[role] || roleConfig.patient;

  return (
    <div className="app-shell min-h-screen">
      <div className="aurora-bg" />
      <div className="mx-auto flex max-w-[1500px] gap-4 p-4">
        <aside className="glass glow-border hidden h-[calc(100vh-2rem)] w-72 flex-col rounded-3xl p-4 lg:flex">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-900/50 p-3">
            <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-200"><Sparkles size={18} /></div>
            <div>
              <p className="text-xs text-slate-400">HFSA-CKD</p>
              <p className="text-sm font-semibold text-slate-100">AI Healthcare Suite</p>
            </div>
          </div>

          <p className="px-2 text-xs uppercase tracking-wide text-slate-400">Workspace</p>
          <nav className="mt-2 flex flex-col gap-2">
            {config.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/35 to-indigo-600/30 text-blue-100 ring-1 ring-blue-400/40"
                        : "glass-soft text-slate-300 hover:text-slate-100"
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-900/45 p-3 text-xs text-slate-300">
            <p className="font-medium text-slate-100">Signed in as {user?.username}</p>
            <p className="mt-1 capitalize text-slate-400">{role}</p>
            <button onClick={logout} className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 text-sm">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4">
          <header className="glass flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">{config.title}</h1>
              <p className="text-xs text-slate-400">Predictive nephrology intelligence and clinical decision support</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">
                <Activity size={13} className="text-emerald-400" />
                System Active
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">
                <CalendarCheck2 size={13} className="text-blue-300" />
                Live Workspace
              </span>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
