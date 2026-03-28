import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Share2, BarChart3, Grid3x3, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import SourcesSidebar from "@/components/notebook/SourcesSidebar";
import StudioSidebar from "@/components/notebook/StudioSidebar";
import ChatArea from "@/components/notebook/ChatArea";
import NotebookEmpty from "@/pages/NotebookEmpty";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { AddSourceDialog } from "@/components/notebook/AddSourceDialog";

export default function Notebook() {
  const { id: notebookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sources, setSources] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const [notebookTitle, setNotebookTitle] = useState("Untitled notebook");
  const [titleSaving, setTitleSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // -----------------------------
  // LOAD SOURCES
  // -----------------------------
  const loadSources = async () => {
    if (!notebookId) return;

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("notebook_id", notebookId);

    if (error) {
      console.error("Failed to load sources:", error);
      return;
    }

    setSources(data || []);

    // Ensure selected source is still valid
    if (data && !data.find((s) => s.id === selectedSourceId)) {
      setSelectedSourceId(null);
    }
  };

  // -----------------------------
  // LOAD NOTEBOOK TITLE
  // -----------------------------
  const loadNotebookTitle = async () => {
    if (!notebookId) return;

    const { data, error } = await supabase
      .from("notebooks")
      .select("title")
      .eq("id", notebookId)
      .single();

    if (error) {
      console.error("Failed to load title:", error);
      return;
    }

    setNotebookTitle(data.title);
  };

  useEffect(() => {
    loadSources();
    loadNotebookTitle();

    const refresh = () => loadSources();
    window.addEventListener("sources-updated", refresh);

    return () => window.removeEventListener("sources-updated", refresh);
  }, [notebookId]);

  // -----------------------------
  // SAVE TITLE
  // -----------------------------
  const saveTitle = async (newTitle: string) => {
    if (!notebookId) return;
    setTitleSaving(true);

    const { error } = await supabase
      .from("notebooks")
      .update({ title: newTitle })
      .eq("id", notebookId);

    setTitleSaving(false);

    if (error) {
      console.error("Rename failed:", error);
      return;
    }

    window.dispatchEvent(new CustomEvent("notebook-renamed"));
  };

  // =======================================================================
  // UI
  // =======================================================================
  return (
    <div className="h-screen flex flex-col bg-background">

      {/* HEADER */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        
        {/* BACK + NOTEBOOK TITLE */}
        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">📓</span>

            <input
              type="text"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              onBlur={() => saveTitle(notebookTitle)}
              className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
            />

            {titleSaving && (
              <span className="text-xs text-muted-foreground">Saving…</span>
            )}
          </div>
        </div>

        {/* RIGHT HEADER ACTIONS */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Analytics
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Grid3x3 className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

      </header>

      {/* MAIN SECTION */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: SOURCES LIST */}
        <SourcesSidebar
          sources={sources}
          selectedSources={selectedSourceId ? [selectedSourceId] : []}
          onSourcesChange={(ids) => setSelectedSourceId(ids[0] || null)}
          onAddSource={() => setDialogOpen(true)}
        />

        {/* MIDDLE: CHAT */}
        {sources.length === 0 ? (
          <NotebookEmpty />
        ) : (
          <ChatArea
            notebookId={notebookId}
            hasSources={sources.length > 0}
            sources={sources}
          />
        )}

        {/* RIGHT: STUDIO (FLASHCARDS, QUIZ, ETC.) */}
        <StudioSidebar 
    selectedSourceId={selectedSourceId}
    notebookId={notebookId!}
/>

      </div>

      {/* UPLOAD DIALOG */}
      <AddSourceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
