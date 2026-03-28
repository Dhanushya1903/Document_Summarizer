import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SourcesSidebarProps {
  sources: any[];
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
  onAddSource: () => void;
}

const SourcesSidebar = ({
  sources,
  selectedSources,
  onSourcesChange,
  onAddSource,
}: SourcesSidebarProps) => {
  
  const allSelected =
    sources.length > 0 && selectedSources.length === sources.length;

  const toggleAll = () => {
    if (allSelected) {
      onSourcesChange([]);
    } else {
      onSourcesChange(sources.map((s) => s.id));
    }
  };

  return (
    <>
      <aside className="w-[280px] border-r border-border flex flex-col bg-background">
        
        {/* HEADER */}
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold mb-3">Sources</h2>

          <Button
            variant="outline"
            size="sm"
            className="flex w-full justify-start gap-2 h-9"
            onClick={onAddSource}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* LIST */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {sources.length > 0 ? (
              <>
                {/* SELECT ALL */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    id="select-all"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Select all
                  </label>
                </div>

                {/* EACH SOURCE */}
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="p-3 rounded-md border border-border hover:bg-accent cursor-pointer transition"
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onSourcesChange([...selectedSources, source.id]);
                            } else {
                              onSourcesChange(
                                selectedSources.filter((id) => id !== source.id)
                              );
                            }
                          }}
                        />

                        <FileText className="h-4 w-4 text-primary mt-[2px]" />

                        {/* TEXT DETAILS */}
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">
                            {source.title}
                          </span>

                          <span className="text-[10px] text-muted-foreground">
                            {source.source_type.toUpperCase()}
                          </span>

                          {/* SUMMARY PREVIEW */}
                          {source.content && (
                            <span className="text-[11px] mt-1 text-muted-foreground line-clamp-3">
                              {source.content}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                No sources added yet
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default SourcesSidebar;
