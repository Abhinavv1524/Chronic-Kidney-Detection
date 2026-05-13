import { Link } from "react-router-dom";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function AboutPage() {
  return (
    <div className="app-shell min-h-screen p-4">
      <div className="aurora-bg" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex gap-2"><Link to="/" className="btn-secondary">Home</Link><Link to="/auth" className="btn-secondary">Login</Link></div>
        <PageScaffold title="About HFSA-CKD" subtitle="AI-powered chronic kidney disease prediction platform">
          <SectionCard title="Mission">Enable early CKD risk identification with explainable AI and coordinated care workflows.</SectionCard>
          <SectionCard title="Project Description">HFSA-CKD combines machine learning prediction, OCR report extraction, role-based dashboards, and patient-doctor appointment workflows.</SectionCard>
          <SectionCard title="Team">Developer • Designer • ML Engineer</SectionCard>
          <SectionCard title="Supervisor & Institution">Capstone Supervisor • MCA Program • Institution Credit</SectionCard>
          <SectionCard title="Technology Stack">React, FastAPI, scikit-learn, SQLite, Tailwind CSS.</SectionCard>
          <SectionCard title="Links">GitHub Repository • Live Demo (if deployed)</SectionCard>
        </PageScaffold>
      </div>
    </div>
  );
}
