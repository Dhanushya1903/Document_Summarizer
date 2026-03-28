// src/components/notebook/AddSourceDialog.tsx

import { useRef } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSourceDialog = ({ open, onOpenChange }: AddSourceDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const { id: notebookId } = useParams<{ id: string }>();

  const onFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    if (!user) return toast.error("User not logged in.");

    const file = filesList[0];

    toast.loading("Sending file to n8n...");

    try {
      // STEP 1: Insert temporary row into Supabase
      const { data: newSource, error: insertErr } = await supabase
        .from("sources")
        .insert({
          title: file.name,
          notebook_id: notebookId,
          user_id: user.id,
          source_type: "document",
          content: null,       // Will update after summary arrives
          file_path: null
        })
        .select()
        .single();

      if (insertErr) {
        toast.error("Failed to create source entry.");
        console.error(insertErr);
        return;
      }

      const sourceId = newSource.id;

      // STEP 2: Send file + metadata to n8n
      const formData = new FormData();
      formData.append("file0", file);  
      formData.append("source_id", sourceId);
      formData.append("user_id", user.id);
      formData.append("notebook_id", notebookId!);

      const res = await fetch("http://localhost:5678/webhook-test/notebooklm", {
        method: "POST",
        body: formData,
      });

      const out = await res.json();
      console.log("N8N Response:", out);

      // STEP 3: Extract summary from n8n
      const summaryText = out?.[0]?.content?.parts?.[0]?.text || "Summary unavailable";

      // STEP 4: Save summary in Supabase
      const { error: updateErr } = await supabase
        .from("sources")
        .update({ content: summaryText })
        .eq("id", sourceId);

      if (updateErr) {
        console.error(updateErr);
        toast.error("Failed to save summary.");
        return;
      }

      toast.dismiss();
      toast.success("Summary generated!");

      // STEP 5: Refresh notebook UI
      window.dispatchEvent(new CustomEvent("sources-updated"));

      // STEP 6: Close dialog
      onOpenChange(false);

    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to process file.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs">📘</span>
            </div>
            <span className="font-semibold">Upload Source</span>
          </div>

          <Button variant="ghost" size="sm" className="text-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            Discover sources
          </Button>
        </DialogHeader>

        <div
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer bg-muted/20 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Upload sources</p>
            <p className="text-sm text-muted-foreground">Click to upload a PDF</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
