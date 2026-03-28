// src/components/notebook/FlashcardsPanel.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";   // 🔥 REQUIRED

interface FlashcardsPanelProps {
  sourceId: string;
  notebookId: string;   // REQUIRED
}

interface FlashcardRow {
  id: string;
  source_id: string;
  front: string;
  back: string;
  created_at: string;
}

const db = supabase as any;

export default function FlashcardsPanel({ sourceId, notebookId }: FlashcardsPanelProps) {
  const [flashcards, setFlashcards] = useState<FlashcardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 🔥 NO MORE 'generatedOnce' LOCK
  const { user } = useAuth();
  const createdBy = user?.id;

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // ----------------------------------------------
  // Load flashcards for this source
  // ----------------------------------------------
  const loadFlashcards = async () => {
    setLoading(true);

    const { data, error } = await db
      .from("flashcards")
      .select("*")
      .eq("source_id", sourceId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFlashcards(data as FlashcardRow[]);
    }

    setLoading(false);
  };

  // ----------------------------------------------
  // Auto-generate flashcards IF none exist
  // ----------------------------------------------
  const generateFlashcards = async () => {
    if (!sourceId) return;

    setGenerating(true);

    // Get source content
    const { data: src, error: srcErr } = await db
      .from("sources")
      .select("content")
      .eq("id", sourceId)
      .single();

    if (srcErr || !src?.content) {
      console.error("Source content missing:", srcErr);
      setGenerating(false);
      return;
    }

    // Send to n8n
    const res = await fetch("http://localhost:5678/webhook/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: src.content }),
    });

    let out: any;
    try {
      out = await res.json();
    } catch {
      console.error("Failed to parse JSON from n8n");
      setGenerating(false);
      return;
    }

    const generated =
      out?.flashcards ??
      out?.[0]?.flashcards ??
      [];

    if (!Array.isArray(generated)) {
      console.error("Flashcards missing or invalid:", out);
      setGenerating(false);
      return;
    }

    // Insert generated flashcards
    for (const card of generated) {
      await db.from("flashcards").insert([
        {
          notebook_id: notebookId,
          source_id: sourceId,
          front: card.front,
          back: card.back,
          created_by: createdBy,
          source_ids: [],
        },
      ]);
    }

    await loadFlashcards();
    setGenerating(false);
  };

  // Load flashcards when source changes
  useEffect(() => {
    loadFlashcards();
  }, [sourceId]);

  // Auto-generate if none exist (🔥 ALWAYS WORKS NOW)
  useEffect(() => {
    if (!loading && flashcards.length === 0) {
      generateFlashcards();
    }
  }, [loading, flashcards, sourceId]);

  // ----------------------------------------------
  // Manual Add
  // ----------------------------------------------
  const addFlashcard = async () => {
    if (!front.trim() || !back.trim()) return;

    const { data, error } = await db
      .from("flashcards")
      .insert([
        {
          notebook_id: notebookId,
          source_id: sourceId,
          front,
          back,
          created_by: createdBy,
          source_ids: [],
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setFlashcards((prev) => [data as FlashcardRow, ...prev]);
      setFront("");
      setBack("");
    }
  };

  const deleteCard = async (id: string) => {
    await db.from("flashcards").delete().eq("id", id);
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
  };

  // ----------------------------------------------
  // UI
  // ----------------------------------------------
  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-3">Flashcards</h3>

      {generating && (
        <div className="text-sm text-muted-foreground mb-3">
          Generating flashcards from your document…
        </div>
      )}

      {/* Manual Add */}
      <div className="mb-4 space-y-2">
        <Input
          placeholder="Front (question)"
          value={front}
          onChange={(e) => setFront(e.target.value)}
        />

        <Textarea
          placeholder="Back (answer)"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="h-20"
        />

        <div className="flex gap-2">
          <Button onClick={addFlashcard}>Add</Button>
          <Button variant="ghost" onClick={() => { setFront(""); setBack(""); }}>
            Clear
          </Button>
        </div>
      </div>

      {/* Flashcards List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2">
          {loading || generating ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : flashcards.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No flashcards yet.
            </div>
          ) : (
            flashcards.map((f) => (
              <div key={f.id} className="border rounded p-3 mb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium">{f.front}</div>
                    <div className="text-xs mt-1 text-muted-foreground">{f.back}</div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => deleteCard(f.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
