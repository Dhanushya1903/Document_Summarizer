import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotebookCardProps {
  id: string;
  title: string;
  icon: string;
  date: string;
  sourceCount: number;
  backgroundColor?: string;
  onDelete?: (id: string) => void;
  onRenameSuccess?: () => void;
}

const NotebookCard = ({
  id,
  title,
  icon,
  date,
  sourceCount,
  backgroundColor,
  onDelete,
  onRenameSuccess,
}: NotebookCardProps) => {
  const navigate = useNavigate();

  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(title);
  const [saving, setSaving] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleCardClick = () => {
    navigate(`/notebook/${id}`);
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("notebooks")
      .update({ title: newName.trim() })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      toast.error("Failed to rename notebook");
      return;
    }

    toast.success("Notebook renamed");
    setRenameOpen(false);
    onRenameSuccess?.();
  };

  return (
    <>
      <Card
        className="relative p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        style={{ backgroundColor }}
        onClick={handleCardClick}
      >
        {/* 3-dots menu */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                Rename
              </DropdownMenuItem>
              {/* Duplicate removed */}
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Icon */}
        <div className="mb-4 text-4xl">{icon}</div>

        {/* Title */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{date}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>
              {sourceCount} source{sourceCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </Card>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename notebook</DialogTitle>
          </DialogHeader>

          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotebookCard;
