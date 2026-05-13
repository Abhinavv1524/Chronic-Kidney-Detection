import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function DoctorAppointmentsPage() {
  return (
    <Layout>
      <PageScaffold title="Doctor Appointment Manager" subtitle="Calendar/list views with status actions and rescheduling">
        <SectionCard title="Views">Calendar view and list view toggles.</SectionCard>
        <SectionCard title="Status Actions">Accept, reject, reschedule, and consultation notes.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
