import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const BUCKET = "notebook-files";

const NotebookEmpty = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { id: notebookId } = useParams<{ id?: string }>();
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !notebookId || !user) return;
    await uploadFiles(files);
  };

  const uploadFiles = async (files: FileList) => {
    toast.loading("Uploading...");

    const userId = user.id; // Ensure user ID is included

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const safeName = file.name.replace(/\s+/g, "_");

      // Storage path
      const path = `${userId}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);

      if (uploadErr) {
        console.error(uploadErr);
        toast.error(`Upload failed: ${file.name}`);
        continue;
      }

      // Insert into Supabase database
      const { error: insertErr } = await supabase.from("sources").insert({
        notebook_id: notebookId,
        user_id: userId,
        title: file.name,
        source_type: "document",   // ✅ FIXED (valid ENUM value)
        file_path: path,
        content: null
      });

      if (insertErr) {
        console.error(insertErr);
        toast.error("Failed to register file in database.");
        continue;
      }
    }

    toast.dismiss();
    toast.success("File uploaded!");

    // Notify notebook to refresh its source list
    window.dispatchEvent(new CustomEvent("sources-updated"));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex-1 flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-medium mb-2">Add a source to get started</h3>

          <p className="text-sm text-muted-foreground text-center mb-4">
            Saved sources will appear here. Click Add sources above to add PDFs, websites, text, videos, or audio files.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button variant="outline" className="gap-2" onClick={handleUploadClick}>
            <FileText className="h-4 w-4" />
            Upload a source
          </Button>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Upload a source to get started"
            disabled
            className="min-h-[50px] max-h-[150px] resize-none"
          />
          <Button size="icon" disabled className="h-[50px] w-[50px] rounded-full shrink-0">
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

export default NotebookEmpty;
