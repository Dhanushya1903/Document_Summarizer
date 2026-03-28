import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, FileText, StickyNote, Volume2, Network } from "lucide-react";

interface ChatAreaProps {
  notebookId?: string;
  hasSources: boolean;
  sources: any[];
}

const ChatArea = ({ notebookId, hasSources, sources }: ChatAreaProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");

    // AI response will be integrated with n8n later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI response will appear here (connected after n8n integration).",
        },
      ]);
    }, 600);
  };

  return (
    <main className="flex-1 flex flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="p-6">

          {!hasSources ? (
            // ================================
            // Empty State
            // ================================
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-medium mb-2">Add a source to get started</h3>

              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Saved sources will appear here. Click Add sources to upload a file.
              </p>
            </div>
          ) : (
            // ================================
            // Main Notebook Content
            // ================================
            <div className="max-w-3xl space-y-10">

              {/* SOURCE SUMMARIES */}
              {sources.map((src) => (
                <div key={src.id} className="space-y-3 pb-6 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      AI
                    </div>

                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">
                        {src.title}
                      </h2>

                      <p className="text-sm text-muted-foreground mb-3">
                        {src.source_type.toUpperCase()}
                      </p>

                      {/* Placeholder summary until n8n fills real AI summary */}
                      <div className="prose prose-sm text-foreground max-w-none">
                        {src.content ? (
                          <p>{src.content}</p>
                        ) : (
                          <p className="italic text-muted-foreground">
                            Summary not generated yet — will appear after n8n AI integration.
                          </p>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" className="gap-2">
                          <StickyNote className="h-4 w-4" />
                          Add note
                        </Button>

                        <Button variant="outline" size="sm" className="gap-2">
                          <Volume2 className="h-4 w-4" />
                          Audio Overview
                        </Button>

                        <Button variant="outline" size="sm" className="gap-2">
                          <Network className="h-4 w-4" />
                          Mind map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* CHAT MESSAGES */}
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        msg.role === "user"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {msg.role === "user" ? "U" : "AI"}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </ScrollArea>

      {/* INPUT AREA */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={hasSources ? "Ask something..." : "Upload a source to start"}
            disabled={!hasSources}
            className="min-h-[50px] max-h-[150px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            size="icon"
            disabled={!message.trim() || !hasSources}
            onClick={handleSend}
            className="h-[50px] w-[50px] rounded-full shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          NotebookLM can make mistakes, please double-check responses
        </p>
      </div>
    </main>
  );
};

export default ChatArea;
