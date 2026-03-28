import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import NoteEditor from "./NoteEditor";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

interface NotesPanelProps {
  notebookId: string;
}

export default function NotesPanel({ notebookId }: NotesPanelProps) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activeNote, setActiveNote] = useState<NoteRow | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("notebook_id", notebookId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
      if (data.length > 0) setActiveNote(data[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (notebookId) loadNotes();
  }, [notebookId]);

  const onSaved = (n: NoteRow) => {
    setNotes(prev => [n, ...prev.filter(p => p.id !== n.id)]);
    setActiveNote(n);
  };

  const onDeleted = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between">
        <h3 className="text-sm font-semibold">Notes</h3>

        <Button
          size="sm"
          onClick={() =>
            setActiveNote({
              id: "",
              notebook_id: notebookId,
              title: "Untitled note",
              content: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              source_id: null,
            })
          }
        >
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar list */}
        <ScrollArea className="w-[220px] border-r p-3">
          {loading ? (
            <div>Loading…</div>
          ) : notes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notes yet</div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className={`p-2 rounded cursor-pointer ${
                  activeNote?.id === n.id ? "bg-accent" : "hover:bg-accent"
                }`}
                onClick={() => setActiveNote(n)}
              >
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {/* Editor */}
        <div className="flex-1">
          {activeNote ? (
            <NoteEditor
              notebookId={notebookId}
              note={activeNote}
              onSaved={onSaved}
              onDeleted={onDeleted}
            />
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              Select or create a note
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
