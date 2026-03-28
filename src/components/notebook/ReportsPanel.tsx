// src/components/notebook/ReportsPanel.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface ReportsPanelProps {
  sourceId: string;
}

interface ReportRow {
  id: string;
  source_id: string;
  title: { value: string }; // JSONB
  content: string; // TEXT
  created_at: string;
}

// Dynamic AI output type
type AIReport = Record<string, any>;

const db = supabase as any;

export default function ReportsPanel({ sourceId }: ReportsPanelProps) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<ReportRow | null>(null);

  // --------------------------------------
  // LOAD REPORTS
  // --------------------------------------
  const load = async () => {
    setLoading(true);

    const { data, error } = await db
      .from("reports")
      .select("*")
      .eq("source_id", sourceId)
      .order("created_at", { ascending: false });

    if (!error && data) setReports(data as ReportRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!sourceId) return;
    load();
  }, [sourceId]);

  // --------------------------------------
  // SAVE MANUAL REPORT
  // --------------------------------------
  const save = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const payload = {
      source_id: sourceId,
      title: { value: title },
      content: content,
      notebook_id: null,
      user_id: null,
      created_by: null,
      report_type: "summary",
    };

    const { data, error } = await db
      .from("reports")
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      setReports((prev) => [data as ReportRow, ...prev]);
      setTitle("");
      setContent("");
    } else {
      console.error("Manual insert error:", error);
      alert("Failed to save report");
    }
  };

  // --------------------------------------
  // DELETE REPORT
  // --------------------------------------
  const remove = async (id: string) => {
    const { error } = await db.from("reports").delete().eq("id", id);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  // --------------------------------------
  // AI REPORT GENERATION
  // --------------------------------------
  const generateAIReport = async () => {
    setGenerating(true);

    const { data: src, error: srcError } = await db
      .from("sources")
      .select("content, notebook_id, user_id")
      .eq("id", sourceId)
      .single();

    if (srcError) console.error(srcError);

    if (!src?.content) {
      alert("Source content missing.");
      setGenerating(false);
      return;
    }

    const res = await fetch("http://localhost:5678/webhook/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: src.content }),
    });

    let out: AIReport = {};

    try {
      out = await res.json();
    } catch {
      alert("Invalid JSON from n8n.");
      setGenerating(false);
      return;
    }

    if (!out || !out.summary) {
      alert("Report generation failed.");
      setGenerating(false);
      return;
    }

    const payload = {
      source_id: sourceId,
      notebook_id: src.notebook_id,
      user_id: src.user_id,
      created_by: src.user_id,
      report_type: "summary",
      title: { value: out.title || "AI Generated Report" },
      content: JSON.stringify(out),
    };

    const { data, error } = await db
      .from("reports")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to save AI report");
      setGenerating(false);
      return;
    }

    const row = data as ReportRow;
    setReports((prev) => [row, ...prev]);
    setSelected(row);
    setGenerating(false);
  };

  // --------------------------------------
  // DYNAMIC RENDERER (ALL headings from n8n)
  // --------------------------------------
  const renderAIReport = (rep: AIReport) => (
    <div className="space-y-6 text-sm">
      {Object.entries(rep).map(([key, value], i) => {
        if (!value) return null;
        if (key === "title") return null; // Title handled separately

        const heading = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <section key={i}>
            <h4 className="font-semibold mb-1">{heading}</h4>

            {Array.isArray(value) ? (
              <ul className="list-disc ml-5">
                {value.map((item: any, idx: number) => (
                  <li key={idx}>
                    {typeof item === "string"
                      ? item
                      : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : typeof value === "object" ? (
              <p className="whitespace-pre-line">
                {JSON.stringify(value, null, 2)}
              </p>
            ) : (
              <p>{value}</p>
            )}
          </section>
        );
      })}
    </div>
  );

  // --------------------------------------
  // UI
  // --------------------------------------
  return (
    <div className="p-4 flex flex-col h-full min-h-0">
      <h3 className="text-sm font-semibold mb-3">Reports</h3>

      <Button className="mb-4" onClick={generateAIReport} disabled={generating}>
        {generating ? "Generating…" : "Generate Report from AI"}
      </Button>

      {/* Manual form */}
      <div className="mb-3 space-y-2">
        <Input
          placeholder="Report title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder="Report content"
          className="h-28"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setTitle("");
              setContent("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* List + viewer */}
      <div className="flex flex-1 gap-3 h-full min-h-0">

        {/* LEFT LIST */}
        <ScrollArea className="w-1/3 h-full border rounded p-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : reports.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reports yet</div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className={`border rounded p-3 mb-2 cursor-pointer ${
                  selected?.id === r.id ? "bg-muted" : ""
                }`}
              >
                <div className="text-sm font-medium">{r.title.value}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(r.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </ScrollArea>

        {/* RIGHT VIEWER — FULL SCROLL */}
        <div className="w-2/3 flex flex-col flex-1 border rounded p-3 overflow-y-auto min-h-0">
          {!selected ? (
            <div className="text-sm text-muted-foreground">
              Select a report to view its details.
            </div>
          ) : (
            renderAIReport(JSON.parse(selected.content))
          )}
        </div>

      </div>
    </div>
  );
}
