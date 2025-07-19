import { CodeSearchForm } from "@/components/CodeSearchForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CodeSearchForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
