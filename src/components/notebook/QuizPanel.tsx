// src/components/notebook/QuizPanel.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuizPanelProps {
  sourceId: string;
}

interface TempQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

interface QuizRow {
  id: string;
  source_id: string;
  title: string;
  questions: TempQuestion[];
  created_at: string;
}

const db = supabase as any;

export default function QuizPanel({ sourceId }: QuizPanelProps) {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<TempQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  // NEW: which quiz is opened
  const [openQuizId, setOpenQuizId] = useState<string | null>(null);

  // LOAD QUIZZES
  const load = async () => {
    const { data } = await db
      .from("quizzes")
      .select("*")
      .eq("source_id", sourceId)
      .order("created_at", { ascending: false });

    setQuizzes((data || []) as QuizRow[]);
  };

  useEffect(() => {
    if (!sourceId) return;
    load();
  }, [sourceId]);

  // MANUAL QUIZ CREATION
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", ""], answerIndex: 0 },
    ]);
  };

  const updateQuestion = (idx: number, patch: Partial<TempQuestion>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...patch };
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const saveQuiz = async () => {
    if (!title.trim() || questions.length === 0) {
      alert("Provide a title and at least one question.");
      return;
    }

    const { data } = await db
      .from("quizzes")
      .insert([
        {
          source_id: sourceId,
          title,
          questions,
        },
      ])
      .select()
      .single();

    if (data) {
      setQuizzes((prev) => [data as QuizRow, ...prev]);
      setTitle("");
      setQuestions([]);
    }
  };

  const removeQuiz = async (id: string) => {
    await db.from("quizzes").delete().eq("id", id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  // AUTO-GENERATION
  const generateQuiz = async () => {
    setGenerating(true);

    const { data: src } = await db
      .from("sources")
      .select("content, notebook_id, user_id")
      .eq("id", sourceId)
      .single();

    if (!src?.content) {
      alert("Source content missing.");
      setGenerating(false);
      return;
    }

    const res = await fetch("http://localhost:5678/webhook/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: src.content }),
    });

    let out;
    try {
      out = await res.json();
    } catch {
      alert("Failed to parse JSON from n8n");
      setGenerating(false);
      return;
    }

    const textBlock =
      out?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textBlock) {
      alert("Quiz generation failed.");
      setGenerating(false);
      return;
    }

    const cleaned = textBlock
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      alert("Could not parse quiz JSON");
      setGenerating(false);
      return;
    }

    const rawQuestions = parsed.quiz;
    if (!rawQuestions) {
      alert("Quiz generation failed.");
      setGenerating(false);
      return;
    }

    const generatedQuestions = rawQuestions.map((q: any) => {
      const correctIndex =
        q.correct && /^[A-D]$/.test(q.correct)
          ? q.correct.charCodeAt(0) - 65
          : q.options.indexOf(q.correct);

      return {
        question: q.question,
        options: q.options,
        answerIndex: correctIndex,
      };
    });

    const { data } = await db
      .from("quizzes")
      .insert([
        {
          source_id: sourceId,
          title: "AI Generated Quiz",
          questions: generatedQuestions,
          created_by: src.user_id,
          notebook_id: src.notebook_id,
        },
      ])
      .select()
      .single();

    if (data) {
      setQuizzes((prev) => [data as QuizRow, ...prev]);
    }

    setGenerating(false);
  };

  // UI
  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-3">Quizzes</h3>

      <Button className="mb-4" onClick={generateQuiz} disabled={generating}>
        {generating ? "Generating Quiz…" : "Generate Quiz from AI"}
      </Button>

      {/* Existing Quizzes */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-2">
          {quizzes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No quizzes yet</div>
          ) : (
            quizzes.map((q) => (
              <div
                key={q.id}
                className="border rounded p-3 mb-2 cursor-pointer"
                onClick={() =>
                  setOpenQuizId(openQuizId === q.id ? null : q.id)
                }
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium">{q.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(q.created_at).toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuiz(q.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>

                {/* EXPANDED QUESTIONS */}
                {openQuizId === q.id && (
                  <div className="mt-3 space-y-4 bg-gray-50 p-3 rounded">
                    {q.questions.map((qq, i) => (
                      <div key={i} className="border p-2 rounded">
                        <div className="font-medium">{`Q${i + 1}. ${
                          qq.question
                        }`}</div>

                        <ul className="mt-2 ml-4 space-y-1">
                          {qq.options.map((opt, oi) => (
                            <li
                              key={oi}
                              className={
                                oi === qq.answerIndex
                                  ? "text-green-600 font-semibold"
                                  : ""
                              }
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
