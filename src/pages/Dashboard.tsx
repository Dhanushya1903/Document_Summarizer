import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Settings, LayoutGrid, List, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotebookCard from '@/components/NotebookCard';
import EmptyState from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNotebooks, setLoadingNotebooks] = useState(true);

  // If not logged in → redirect to auth
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchNotebooks();
    }
  }, [user]);

  const fetchNotebooks = async () => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      toast.error('Failed to load notebooks');
    } finally {
      setLoadingNotebooks(false);
    }
  };

  // 🔄 Used after rename
  const handleRenameSuccess = () => {
    fetchNotebooks();
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', notebookId);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebookId));
      toast.success('Notebook deleted');
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    }
  };

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
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Update UI instantly
      setNotebooks([data, ...notebooks]);

      // Redirect to notebook
      navigate(`/notebook/${data.id}`);
    } catch (error) {
      console.error('Create notebook error:', error);
      toast.error('Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading || loadingNotebooks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs">📓</span>
            </div>
            <h1 className="text-lg font-medium text-foreground">NotebookLM</h1>
          </div>

          {/* Profile / Settings */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </header>

      {/* BODY */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">

        <h2 className="text-3xl font-normal text-foreground mb-8">Your notebooks</h2>

        {notebooks.length === 0 ? (
          <EmptyState onCreateNotebook={handleCreateNotebook} />
        ) : (
          <div className="space-y-6">
            
            {/* Create Button */}
            <div className="flex items-center justify-between">
              <Button onClick={handleCreateNotebook} className="rounded-full" disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create new'}
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notebook Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-2'
              }
            >
              {notebooks.map(notebook => (
                <NotebookCard
                  key={notebook.id}
                  id={notebook.id}
                  title={notebook.title}
                  icon="📓"
                  date={new Date(notebook.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  sourceCount={0}
                  backgroundColor="hsl(260, 40%, 95%)"
                  onDelete={handleDeleteNotebook}
                  onRenameSuccess={handleRenameSuccess}
                />
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
