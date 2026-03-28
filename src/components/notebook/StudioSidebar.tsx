// src/components/notebook/StudioSidebar.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Volume2,
  StickyNote,
  Info,
  ChevronLeft,
  BookOpen,
  Pencil,
  FileBarChart,
} from "lucide-react";

import FlashcardsPanel from "./FlashcardsPanel";
import QuizPanel from "./QuizPanel";
import ReportsPanel from "./ReportsPanel";
import NotesPanel from "./NotesPanel";
import AudioOverview from "./AudioOverview";

interface StudioSidebarProps {
  selectedSourceId: string | null;
  notebookId: string;
}

export default function StudioSidebar({ selectedSourceId, notebookId }: StudioSidebarProps) {
  const [activePanel, setActivePanel] =
    useState<"flashcards" | "quiz" | "reports" | "notes" | "audio" | null>(null);

  const ensureSourceSelected = (panel: "flashcards" | "quiz" | "reports") => {
    if (!selectedSourceId) {
      alert("Please select a source first.");
      return;
    }
    setActivePanel(panel);
  };

  // ------------------------------------------------------
  // AUDIO PANEL (NEW)
  // ------------------------------------------------------
  if (activePanel === "audio") {
    return (
      <aside className="w-[320px] border-l border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">Audio Overview</h2>
        </div>

        <AudioOverview notebookId={notebookId} />
      </aside>
    );
  }

  // ------------------------------------------------------
  // FLASHCARDS PANEL
  // ------------------------------------------------------
  if (activePanel === "flashcards" && selectedSourceId) {
    return (
      <aside className="w-[320px] border-l border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">Flashcards</h2>
        </div>

        <FlashcardsPanel sourceId={selectedSourceId} notebookId={notebookId} />
      </aside>
    );
  }

  // ------------------------------------------------------
  // QUIZ PANEL
  // ------------------------------------------------------
  if (activePanel === "quiz" && selectedSourceId) {
    return (
      <aside className="w-[320px] border-l border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">Quizzes</h2>
        </div>

        <QuizPanel sourceId={selectedSourceId} />
      </aside>
    );
  }

  // ------------------------------------------------------
  // REPORTS PANEL
  // ------------------------------------------------------
  if (activePanel === "reports" && selectedSourceId) {
    return (
      <aside className="w-[320px] border-l border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">Reports</h2>
        </div>

        <ReportsPanel sourceId={selectedSourceId} />
      </aside>
    );
  }

  // ------------------------------------------------------
  // NOTES PANEL
  // ------------------------------------------------------
  if (activePanel === "notes") {
    return (
      <aside className="w-[320px] border-l border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold">Notes</h2>
        </div>

        <NotesPanel notebookId={notebookId} />
      </aside>
    );
  }

  // ------------------------------------------------------
  // MAIN SIDEBAR MENU
  // ------------------------------------------------------
  return (
    <aside className="w-[320px] border-l border-border flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold">Studio</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">

          {/* Audio Overview (ENABLED NOW) */}
          <div
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
            onClick={() => setActivePanel("audio")}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Audio Overview</h3>
              </div>
              <ChevronLeft className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Generate and listen to audio summary for your notebook.
            </p>
          </div>

          {/* Flashcards */}
          <div
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
            onClick={() => ensureSourceSelected("flashcards")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Flashcards</h3>
              </div>
              <ChevronLeft className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Create and review flashcards from your document.
            </p>
          </div>

          {/* Quiz */}
          <div
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
            onClick={() => ensureSourceSelected("quiz")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Quiz Generator</h3>
              </div>
              <ChevronLeft className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Create quizzes based on your source.
            </p>
          </div>

          {/* Reports */}
          <div
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
            onClick={() => ensureSourceSelected("reports")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Reports</h3>
              </div>
              <ChevronLeft className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Generate insights and summaries.
            </p>
          </div>

          {/* Notes */}
          <div
            className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
            onClick={() => setActivePanel("notes")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Notes</h3>
              </div>
              <ChevronLeft className="-rotate-90 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Write your own notes.
            </p>
          </div>

        </div>
      </ScrollArea>
    </aside>
  );
}
