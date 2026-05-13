import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function DoctorSettingsPage() {
  return (
    <Layout>
      <PageScaffold title="Doctor Settings" subtitle="Profile, availability, and notification preferences">
        <SectionCard title="Profile">Name, specialization, contact, and credential details.</SectionCard>
        <SectionCard title="Preferences">Availability slots, reminder preferences, and secure password update.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
