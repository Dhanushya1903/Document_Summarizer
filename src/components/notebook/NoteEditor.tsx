import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

interface Props {
  notebookId: string;
  note: NoteRow | null;
  onSaved: (note: NoteRow) => void;
  onDeleted: (id: string) => void;
}

export default function NoteEditor({ notebookId, note, onSaved, onDeleted }: Props) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }, [note]);

  const save = async () => {
    setSaving(true);

    if (note?.id) {
      const { data, error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", note.id)
        .select()
        .single();

      if (!error && data) onSaved(data);
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            notebook_id: notebookId,
            title,
            content,
          },
        ])
        .select()
        .single();

      if (!error && data) onSaved(data);
    }

    setSaving(false);
  };

  const deleteNote = async () => {
    if (!note?.id) return;
    if (!confirm("Delete this note?")) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", note.id);

    if (!error) onDeleted(note.id);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 mb-3"
      />

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>

        {note?.id && (
          <Button variant="destructive" onClick={deleteNote}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
