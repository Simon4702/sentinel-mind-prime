import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { Layout } from "@/components/Layout";

const Executive = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ExecutiveDashboard />
      </div>
    </Layout>
  );
};

export default Executive;
