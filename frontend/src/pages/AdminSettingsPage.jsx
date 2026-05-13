import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function AdminSettingsPage() {
  return (
    <Layout>
      <PageScaffold title="Admin Settings" subtitle="Security, preferences, and environment controls">
        <SectionCard title="Access Settings">Password, MFA preference, and session controls.</SectionCard>
        <SectionCard title="Platform Preferences">Theme, notification channels, and report defaults.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
