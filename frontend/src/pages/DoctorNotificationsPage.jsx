import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function DoctorNotificationsPage() {
  return (
    <Layout>
      <PageScaffold title="Doctor Notifications" subtitle="Appointment requests, risk alerts, report updates, and system notices">
        <SectionCard title="Filters">All / Appointments / Risk Alerts / Reports / System.</SectionCard>
        <SectionCard title="Notification Feed">Inline actions for appointment acceptance/rejection and read/delete controls.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
