import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function EducationPage() {
  return (
    <Layout>
      <PageScaffold title="CKD Education" subtitle="Understand stages, lifestyle, diet, and prevention guidance">
        <SectionCard title="What is CKD?">Introductory explainer with kidney-focused overview.</SectionCard>
        <SectionCard title="GFR Stage Explorer">Interactive stage details from G1 to G5 with symptoms and diet advice.</SectionCard>
        <SectionCard title="Lifestyle & FAQ">Hydration, exercise, stress, smoking, FAQs, and trusted external links.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
