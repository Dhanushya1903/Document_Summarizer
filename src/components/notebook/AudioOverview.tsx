// src/components/notebook/AudioOverview.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AudioOverviewProps {
  notebookId: string;
}

export default function AudioOverview({ notebookId }: AudioOverviewProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // -----------------------------------------------------
  // Load audio row from Supabase — FULLY UNTYPED
  // -----------------------------------------------------
  const loadAudio = async () => {
    setLoading(true);

    // Entire query forced to "any" to avoid TS errors
    const query = (supabase as any)
      .from("audio_overview" as any)
      .select("*" as any)
      .eq("notebook_id", notebookId)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      setAudioUrl(null);
      setLoading(false);
      return;
    }

    if (data && data.audio_url) {
      setAudioUrl(data.audio_url);
    } else {
      setAudioUrl(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (notebookId) loadAudio();
  }, [notebookId]);

  // -----------------------------------------------------
  // Call n8n Webhook to trigger audio generation
  // -----------------------------------------------------
  const handleGenerateAudio = async () => {
    setGenerating(true);

    try {
      const res = await fetch("http://localhost:5678/webhook/audio-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook_id: notebookId }),
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("Failed to generate audio.");
        setGenerating(false);
        return;
      }

      // Optional — debug response
      console.log("n8n response:", await res.json());

      // small wait for Supabase insert to finish
      await new Promise((r) => setTimeout(r, 1000));

      loadAudio();
    } catch (err) {
      console.error(err);
      alert("Error generating audio.");
    }

    setGenerating(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Audio Overview</h2>

      <Button onClick={handleGenerateAudio} disabled={generating}>
        {generating ? "Generating..." : "Generate Audio Overview"}
      </Button>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading audio…</p>
        ) : audioUrl ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Latest audio:</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No audio overview yet. Click the button above.
          </p>
        )}
      </div>
    </div>
  );
}
