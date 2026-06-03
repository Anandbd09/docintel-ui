import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, Loader2, Search, MessageSquare, FileText } from "lucide-react";
import { getAuditLogs, type AuditLog } from "@/lib/api";
import { formatDate, useUserId } from "@/lib/userStore";
import { toast } from "sonner";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Log — DocIntel AI" }] }),
  component: AuditPage,
});

function AuditPage() {
  const [userId] = useUserId();
  const [input, setInput] = useState(userId);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async (uid: string) => {
    if (!uid.trim()) return toast.error("Enter a User ID");
    setLoading(true);
    try {
      const res = await getAuditLogs(uid.trim());
      setLogs(Array.isArray(res.data) ? res.data : []);
      setLoaded(true);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load(userId);
  }, []);

  return (
    <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Compliance</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Audit Log</h1>
        <p className="mt-2 text-muted-foreground">Complete history of all queries made on your documents.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); load(input); }}
        className="glass-strong rounded-2xl p-3 flex items-center gap-2 shadow-elegant mb-8"
      >
        <Search className="h-4 w-4 text-muted-foreground ml-3" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter User ID to load audit logs"
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

      {loading && (
        <div className="space-y-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && loaded && logs.length === 0 && (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <History className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-lg">No audit logs yet</h3>
          <p className="text-sm text-muted-foreground mt-2">Logs appear after you query documents.</p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-4">{logs.length} queries recorded</p>
          {logs.map((log, i) => (
            <div key={log.id || i} className="glass-strong rounded-2xl p-5 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</span>
                </div>
              </div>
              <p className="text-sm font-medium mb-2">{log.question}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{log.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}