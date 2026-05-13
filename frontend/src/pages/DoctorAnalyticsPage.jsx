import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function DoctorAnalyticsPage() {
  return (
    <Layout>
      <PageScaffold title="Doctor Analytics" subtitle="Clinical cohort metrics, risk factors, and trends">
        <SectionCard title="KPI Metrics">Assessed patients, average probability, high-risk count, and appointments.</SectionCard>
        <SectionCard title="Risk Charts">Distribution pie, risk-factor bars, and monthly trend lines.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
