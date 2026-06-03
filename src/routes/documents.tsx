import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Image as ImageIcon, Inbox, Loader2, MessageSquare, Search, GitCompare, X, Trash2, RefreshCw } from "lucide-react";
import { listDocuments, compareDocuments, type DocumentItem, api } from "@/lib/api";
import { formatBytes, formatDate, useUserId } from "@/lib/userStore";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — DocIntel AI" }] }),
  component: DocumentsPage,
});

const statusStyles: Record<string, string> = {
  UPLOADING: "bg-warning/15 text-warning border-warning/30",
  PROCESSING: "bg-primary/15 text-primary border-primary/30",
  READY: "bg-success/15 text-success border-success/30",
  FAILED: "bg-destructive/15 text-destructive border-destructive/30",
};

function DocumentsPage() {
  const [userId, setUserId] = useUserId();
  const [input, setInput] = useState(userId);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareQuestion, setCompareQuestion] = useState("");
  const [compareResult, setCompareResult] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading: loading, isFetched: loaded } = useQuery<DocumentItem[]>({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const res = await listDocuments(userId);
      return Array.isArray(res.data) ? res.data : (res.data as any)?.documents ?? [];
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some(d => {
        const s = d.status.toUpperCase();
        return s === "UPLOADING" || s === "PROCESSING";
      });
      return hasPending ? 4000 : false;
    },
  });
  const allTags = [...new Set(docs.flatMap(d => d.tags || []))];
  const filteredDocs = selectedTag
    ? docs.filter(d => d.tags?.includes(selectedTag))
    : docs;

  const load = (uid: string) => {
    if (!uid.trim()) return toast.error("Enter a User ID");
    setUserId(uid.trim());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) {
        toast.error("You can only compare 2 documents at a time");
        return prev;
      }
      return [...prev, id];
    });
  };

  const compare = async () => {
    if (!compareQuestion.trim()) return toast.error("Enter a comparison question");
    setComparing(true);
    setCompareResult(null);
    try {
      const res = await compareDocuments(userId, selected[0], selected[1], compareQuestion);
      setCompareResult(res.data?.answer || "No comparison result");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const removeDoc = (id: string) => {
      queryClient.setQueryData<DocumentItem[]>(["documents", userId], prev =>
        (prev ?? []).filter(doc => doc.id !== id)
      );
      setSelected(prev => prev.filter(i => i !== id));
    };
    try {
      await api.delete(`/api/documents/${userId}/${deleteTarget.id}`);
      removeDoc(deleteTarget.id);
      toast.success("Document deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      // 204 No Content is success
      if (err?.response?.status === 204 || !err?.response?.status) {
        removeDoc(deleteTarget.id);
        toast.success("Document deleted");
        setDeleteTarget(null);
      } else {
        toast.error("Failed to delete document");
      }
    } finally {
      setDeleting(false);
    }
  };

  const selectedDocs = docs.filter(d => selected.includes(d.id));

  return (
    <div className="px-6 lg:px-12 py-12 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Library</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Your Documents</h1>
          <p className="mt-2 text-muted-foreground">All documents you've processed with DocIntel AI.</p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); load(input); }}
        className="glass-strong rounded-2xl p-3 flex items-center gap-2 shadow-elegant mb-8"
      >
        <Search className="h-4 w-4 text-muted-foreground ml-3" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your User ID to load documents"
          className="flex-1 bg-transparent text-sm py-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium shadow-glow hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
        </button>
      </form>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-muted-foreground self-center">Filter:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition ${selectedTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent/50 transition"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Compare Banner */}
      {selected.length > 0 && (
        <div className="glass-strong rounded-2xl p-4 mb-6 border border-primary/30 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selected.length === 1 ? "Select one more document to compare" : "Compare selected documents"}
              </span>
            </div>
            <button
              onClick={() => { setSelected([]); setCompareResult(null); }}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selected doc names */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedDocs.map(d => (
              <span key={d.id} className="text-xs glass px-2.5 py-1 rounded-full text-primary border border-primary/20">
                {d.name}
              </span>
            ))}
          </div>

          {/* Compare input */}
          {selected.length === 2 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={compareQuestion}
                onChange={(e) => setCompareQuestion(e.target.value)}
                placeholder="What would you like to compare? e.g. How do both handle inheritance?"
                className="flex-1 bg-input/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={compare}
                disabled={comparing || !compareQuestion.trim()}
                className="bg-gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium shadow-glow disabled:opacity-40 transition hover:opacity-90 flex items-center justify-center gap-2 sm:w-auto w-full"
              >
                {comparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><GitCompare className="h-4 w-4" /> Compare</>}
              </button>
            </div>
          )}

          {/* Compare Result */}
          {compareResult && (
            <div className="mt-4 glass rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {compareResult}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass rounded-2xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && loaded && docs.length === 0 && (
        <div className="glass-strong rounded-2xl p-12 text-center animate-fade-in-up">
          <div className="inline-flex p-4 rounded-2xl bg-primary/15 mb-4">
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-xl">No documents yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first document to get started.</p>
          <Link
            to="/upload"
            className="mt-6 inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium shadow-glow hover:opacity-90 transition"
          >
            Upload Document
          </Link>
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((d, i) => {
            const id = d.id;
            const name = d.name;
            const type = d.contentType.toLowerCase();
            const isImage = type.includes("image") || /\.(png|jpe?g)$/i.test(name);
            const Icon = isImage ? ImageIcon : FileText;
            const size = d.size;
            const date = d.createdOn;
            const status = d.status.toUpperCase();
            const isSelected = selected.includes(id);
            return (
              <div
                key={id || i}
                className={`glass-strong rounded-2xl p-5 hover-lift animate-fade-in-up transition-all ${isSelected ? "ring-2 ring-primary shadow-glow" : ""
                  }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                        }`}
                    >
                      {isSelected && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                    <div className="p-2.5 rounded-xl bg-gradient-primary shadow-glow">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusStyles[status] || "bg-muted text-muted-foreground border-border"}`}>
                    {status || "—"}
                  </span>
                </div>
                <div className="mt-4 font-medium truncate" title={name}>{name}</div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                  <span>{formatBytes(size)}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
                  <span>{formatDate(date)}</span>
                </div>
                {d.tags && d.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to="/query/$docId"
                  params={{ docId: id }}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 glass rounded-xl py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition group"
                >
                  <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Ask AI
                </Link>
                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget({ id, name })}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>

                {/* Re-process button */}
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/api/documents/${userId}/${id}/reprocess`);
                      queryClient.setQueryData<DocumentItem[]>(["documents", userId], prev =>
                        (prev ?? []).map(doc => doc.id === id ? { ...doc, status: "UPLOADING" } : doc)
                      );
                      toast.success("Re-processing started");
                    } catch {
                      toast.error("Failed to re-process document");
                    }
                  }}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-primary hover:bg-primary/10 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-process
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm shadow-elegant border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-destructive/15">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="font-display font-semibold text-lg">Delete Document</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Are you sure you want to delete <span className="font-medium text-foreground">"{deleteTarget.name}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 glass rounded-xl py-2.5 text-sm font-medium hover:bg-muted/50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}