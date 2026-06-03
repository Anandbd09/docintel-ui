import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, FileText, Loader2, Send, Mic, MicOff } from "lucide-react";
import { crossSearchDocuments, type CrossSearchResponse } from "@/lib/api";
import { useUserId } from "@/lib/userStore";
import { toast } from "sonner";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — DocIntel AI" }] }),
  component: SearchPage,
});

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function SearchPage() {
  const [userId] = useUserId();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<CrossSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!SpeechRecognition) {
      toast.error("Voice not supported. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      setQuestion(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!userId) return toast.error("Set your User ID first");

    setLoading(true);
    setResult(null);
    try {
      const res = await crossSearchDocuments(userId, question.trim());
      setResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Cross Search</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Search All Documents</h1>
        <p className="mt-2 text-muted-foreground">Ask a question across your entire document library.</p>
      </div>

      <form onSubmit={search} className="glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-elegant mb-8">
        <button
          type="button"
          onClick={listening ? () => setListening(false) : startListening}
          className={`p-2.5 rounded-xl transition ${
            listening ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything across all your documents…"
          className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-glow disabled:opacity-40 transition hover:scale-105"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {loading && (
        <div className="glass-strong rounded-2xl p-8 text-center animate-fade-in-up">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Searching across all your documents…</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* AI Answer */}
          <div className="glass-strong rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-primary">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DocIntel AI</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
          </div>

          {/* Document Matches */}
          {result.documentMatches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Found in {result.documentMatches.length} document{result.documentMatches.length > 1 ? "s" : ""}
              </h3>
              <div className="space-y-3">
                {result.documentMatches.map((match, i) => (
                  <div key={i} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{match.docName}</span>
                      </div>
                      <Link
                        to="/query/$docId"
                        params={{ docId: match.docId }}
                        className="text-xs text-primary hover:underline"
                      >
                        Ask more →
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {match.relevantChunks.slice(0, 2).map((chunk, j) => (
                        <p key={j} className="text-xs text-muted-foreground glass rounded-xl p-3 line-clamp-2">
                          {chunk}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}