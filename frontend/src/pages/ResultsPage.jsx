import { useParams } from "react-router-dom";
import Layout from "../components/core/Layout";
import { PageScaffold, SectionCard } from "../components/core/PageScaffold";

export default function ResultsPage() {
  const { id } = useParams();
  return (
    <Layout>
      <PageScaffold title={`Detailed Results #${id}`} subtitle="Risk gauge, feature importance, recommendations, and comparison">
        <SectionCard title="Risk Gauge">Low / Moderate / High dial with probability and stage indicator.</SectionCard>
        <SectionCard title="Feature Importance">Horizontal bars showing top contributing features.</SectionCard>
        <SectionCard title="Input Summary & Recommendation">Table of submitted values and AI recommendation paragraph.</SectionCard>
        <SectionCard title="Actions">Download PDF • Share with Doctor • Compare with previous result.</SectionCard>
      </PageScaffold>
    </Layout>
  );
}
