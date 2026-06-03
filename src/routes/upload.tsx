import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { getDocumentStatus, uploadDocument } from "@/lib/api";
import { useUserId } from "@/lib/userStore";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload — DocIntel AI" }] }),
  component: UploadPage,
});

type Status = "IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];

function UploadPage() {
  const [userId, setUserId] = useUserId();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>("IDLE");
  const [docId, setDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>("");

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Unsupported file type. Use PDF, PNG, or JPG.");
      return;
    }
    setFile(f);
    setStatus("IDLE");
    setProgress(0);
    setError(null);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const startPolling = useCallback((id: string, uid: string) => {
    stopPolling();
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // 5 minutes (100 × 3s) — Ollama embedding takes time
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        stopPolling();
        setStatus("FAILED");
        setError("Processing timed out. Please try again.");
        return;
      }
      try {
        const res = await getDocumentStatus(uid, id);
        const s = (res.data?.status || "").toUpperCase();
        const prog = (res.data as any)?.progress || "";
        setProgressMsg(prog);
        if (s === "READY") {
          setStatus("READY");
          stopPolling();
          toast.success("Document is ready! You can now query it.");
        } else if (s === "FAILED") {
          setStatus("FAILED");
          setError("Processing failed.");
          stopPolling();
        }
      } catch (e) {
        // keep trying
      }
    }, 3000);
  }, []);

  const handleUpload = async () => {
    if (!file) return toast.error("Choose a file first");
    if (!userId.trim()) return toast.error("Enter your User ID");

    setStatus("UPLOADING");
    setProgress(0);
    setError(null);
    try {
      const res = await uploadDocument(file, userId.trim(), (p) => setProgress(p));
      const id = res.data?.id;
      setDocId(id);
      setStatus("PROCESSING");
      toast.success("Uploaded! Processing started…");
      if (id) startPolling(id, userId.trim());
    } catch (e: any) {
      setStatus("FAILED");
      setError(e?.response?.data?.message || e?.message || "Upload failed");
      toast.error("Upload failed");
    }
  };

  const reset = () => {
    stopPolling();
    setFile(null);
    setProgress(0);
    setStatus("IDLE");
    setDocId(null);
    setError(null);
    setProgressMsg("");
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Step 01</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Upload a document</h1>
        <p className="mt-2 text-muted-foreground">We support PDFs and images. Files are processed through our RAG pipeline.</p>
      </div>

      <div className="glass-strong rounded-2xl p-6 shadow-elegant space-y-6 animate-fade-in-up">
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. user_alex_92"
            className="mt-2 w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 sm:p-10 text-center ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/20"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {!file ? (
            <>
              <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-4 animate-float">
                <UploadCloud className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-base font-medium">Drop your file here, or <span className="text-primary">browse</span></div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {["PDF", "PNG", "JPG"].map((t) => (
                  <span key={t} className="glass rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-primary/20"><FileText className="h-5 w-5 text-primary" /></div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {status !== "IDLE" && (
          <div className="space-y-3">
            <StatusBar status={status} progress={progress} />
            {progressMsg && status === "PROCESSING" && (
              <p className="text-xs text-primary animate-pulse text-center">
                {progressMsg}
              </p>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || status === "UPLOADING" || status === "PROCESSING"}
            className="flex-1 bg-gradient-primary text-primary-foreground px-5 py-3 rounded-xl font-medium shadow-glow hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "UPLOADING" ? "Uploading…" : status === "PROCESSING" ? "Processing…" : status === "READY" ? "Ready ✓" : "Upload & Process"}
          </button>
          {status === "READY" && docId && (
            <a
              href={`/query/${docId}`}
              className="glass-strong px-5 py-3 rounded-xl font-medium hover:bg-accent/50 transition"
            >
              Ask AI →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ status, progress }: { status: Status; progress: number }) {
  const cfg: Record<Status, { color: string; label: string; icon: React.ReactNode; pct: number }> = {
    IDLE: { color: "", label: "", icon: null, pct: 0 },
    UPLOADING: { color: "bg-warning", label: "Uploading", icon: <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />, pct: progress },
    PROCESSING: { color: "bg-primary", label: "Processing", icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />, pct: 100 },
    READY: { color: "bg-success", label: "Ready", icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" />, pct: 100 },
    FAILED: { color: "bg-destructive", label: "Failed", icon: <AlertCircle className="h-3.5 w-3.5 text-destructive" />, pct: 100 },
  };
  const c = cfg[status];
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2 font-medium">
          {c.icon}
          <span>{c.label}</span>
        </div>
        <span className="text-muted-foreground">{status === "UPLOADING" ? `${progress}%` : ""}</span>
      </div>
      <div className="h-1.5 rounded-full bg-input overflow-hidden">
        <div
          className={`h-full ${c.color} transition-all duration-500 ${status === "PROCESSING" ? "animate-pulse" : ""}`}
          style={{ width: `${c.pct}%` }}
        />
      </div>
    </div>
  );
}
