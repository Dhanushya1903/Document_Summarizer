import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNotebook = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCreating(true);
    try {
      // Ensure profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
          },
          { onConflict: 'id' }
        );

      if (profileError) throw profileError;

      // Create notebook
      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to the actual notebook page with ID
      navigate(`/notebook/${data.id}`);
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Welcome to MyNotebookLM</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-card rounded-lg border shadow-sm p-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Create your first notebook</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              MyNotebookLM is an AI-powered research and writing assistant that works best with the sources you
              upload.
            </p>
          </div>

          {/* Source Types */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">PDFs & Docs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>Upload research papers, reports, and documents</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Websites</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>Add web pages and online articles as sources</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCreateNotebook}
              size="lg"
              className="min-w-[200px]"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create notebook'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
