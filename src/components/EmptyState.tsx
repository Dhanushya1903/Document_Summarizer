import { Button } from '@/components/ui/button';
import { Headphones, Upload, Users } from 'lucide-react';

interface EmptyStateProps {
  onCreateNotebook: () => void;
}

const EmptyState = ({ onCreateNotebook }: EmptyStateProps) => {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
      <div className="space-y-4">
        <h2 className="text-2xl font-medium text-foreground">Create your first notebook</h2>
        <p className="text-muted-foreground">
          NotebookLM is an AI-powered research and writing assistant that works best with the sources you upload
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Headphones className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">Gain new understandings about any document</h3>
          <p className="text-sm text-muted-foreground">
            Convert complex material into easy-to-understand formats like Audio Overviews, FAQs or briefing docs
          </p>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">A chatbot grounded in your sources</h3>
          <p className="text-sm text-muted-foreground">
            Upload your documents and NotebookLM will answer detailed questions or surface key insights
          </p>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">Share your insights</h3>
          <p className="text-sm text-muted-foreground">
            Add key resources to a notebook with your organization to create a shared knowledge base
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Try an example notebook</p>
        <Button onClick={onCreateNotebook} size="lg" className="rounded-full">
          Create new notebook
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
