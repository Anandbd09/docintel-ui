import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Send, Sparkles, Check, Loader2, BookOpen, Mic, MicOff, Volume2, FileText } from "lucide-react";
import { getQueryHistory, queryDocument, summarizeDocument } from "@/lib/api";
import { useUserId } from "@/lib/userStore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";


export const Route = createFileRoute("/query/$docId")({
  head: () => ({ meta: [{ title: "Query — DocIntel AI" }] }),
  component: QueryPage,
});

interface QAItem {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  displayed: string;
  done: boolean;
}

// Voice recognition setup
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function QueryPage() {
  const { docId } = Route.useParams();
  const [userId] = useUserId();
  const [question, setQuestion] = useState("");
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items, loading]);

  // Fetch history on load
  useEffect(() => {
    if (userId && docId) {
      getQueryHistory(userId, docId)
        .then(res => setHistory(res.data || []))
        .catch(() => { });
    }
  }, [userId, docId]);

  // Text to speech
  const speak = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();

    let cleanText = text
      .replace(/```[\s\S]*?```/g, "See the code example on screen.")
      .replace(/`[^`]*`/g, "")
      .replace(/\*\*/g, "")
      .replace(/[#*_~]/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.name === "Google UK English Female") ||
      voices.find(v => v.name === "Google US English") ||
      voices.find(v => v.name.includes("Google")) ||
      voices.find(v => v.lang === "en-US" && !v.localService) ||
      voices.find(v => v.lang === "en-US");

    if (preferred) utterance.voice = preferred;

    // Track speaking state
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };
  // Speech to text
  const toggleVoiceInput = () => {
    if (listening) {
      stopListening();
      return;
    }
    if (!SpeechRecognition) {
      toast.error("Voice not supported. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed.");
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setQuestion(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        setListening(false);
        // Auto submit after speech ends
        setTimeout(() => {
          if (transcript.trim()) {
            setQuestion(transcript);
            // Trigger form submit directly
            document.querySelector<HTMLFormElement>("form")?.requestSubmit();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    if (!userId) return toast.error("Set your User ID first");

    setQuestion("");
    setLoading(true);
    window.speechSynthesis.cancel();
    try {
      const res = await queryDocument(userId, docId, q);
      const answer = res.data?.answer || "No answer returned.";
      const sources = res.data?.sources || [];
      const id = crypto.randomUUID();
      const item: QAItem = { id, question: q, answer, sources, displayed: "", done: false };
      setItems((prev) => [...prev, item]);
      // Typing animation
      let i = 0;
      const interval = setInterval(() => {
        i += Math.max(2, Math.floor(answer.length / 100));
        setItems((prev) =>
          prev.map((it) => it.id === id ? { ...it, displayed: answer.slice(0, i) } : it)
        );
        if (i >= answer.length) {
          clearInterval(interval);
          setItems((prev) =>
            prev.map((it) => it.id === id ? { ...it, displayed: answer, done: true } : it)
          );
          // Speak the answer after typing animation completes
          speak(answer);
        }
      }, 15);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Query failed");
    } finally {
      setLoading(false);
    }
  };
  const summarize = async () => {
    if (!userId) return toast.error("Set your User ID first");
    setLoading(true);
    window.speechSynthesis.cancel();
    try {
      const res = await summarizeDocument(userId, docId);
      const answer = res.data?.answer || "No summary returned.";
      const sources = res.data?.sources || [];
      const id = crypto.randomUUID();
      const item: QAItem = {
        id,
        question: "📄 Summarize this document",
        answer,
        sources,
        displayed: "",
        done: false
      };
      setItems((prev) => [...prev, item]);
      let i = 0;
      const interval = setInterval(() => {
        i += Math.max(2, Math.floor(answer.length / 100));
        setItems((prev) =>
          prev.map((it) => it.id === id ? { ...it, displayed: answer.slice(0, i) } : it)
        );
        if (i >= answer.length) {
          clearInterval(interval);
          setItems((prev) =>
            prev.map((it) => it.id === id ? { ...it, displayed: answer, done: true } : it)
          );
          speak(answer);
        }
      }, 15);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Summarization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Breadcrumb */}
      <header className="px-4 lg:px-12 py-3 lg:py-5 border-b border-border/50 glass sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 lg:gap-4">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Link to="/documents" className="text-muted-foreground hover:text-foreground transition flex items-center gap-1">
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Documents</span>
            </Link>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="font-mono text-xs glass-strong px-2 py-1 rounded-md truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">{docId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            {/* Voice toggle */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                window.speechSynthesis.cancel();
                toast.success(voiceEnabled ? "Voice disabled" : "Voice enabled");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition ${voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{voiceEnabled ? "Voice On" : "Voice Off"}</span>
            </button>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">AI Query</span>
            <button
              onClick={summarize}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-strong text-xs font-medium hover:bg-accent/50 transition disabled:opacity-40"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Summarize</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {items.length === 0 && !loading && (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-4 animate-float">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold">Ask anything about this document</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                Try speaking 🎤 or type your question below
              </p>
              {history.length > 0 && (
                <div className="mt-8 text-left max-w-md mx-auto">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Previous questions</p>
                  <div className="space-y-2">
                    {history
                      .filter(h => h.startsWith("User: "))
                      .map((h, i) => (
                        <button
                          key={i}
                          onClick={() => setQuestion(h.replace("User: ", ""))}
                          className="w-full text-left text-sm glass rounded-xl px-4 py-2.5 hover:bg-accent/50 transition text-muted-foreground hover:text-foreground"
                        >
                          {h.replace("User: ", "")}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {items.map((it) => (
            <QAExchange key={it.id} item={it} />
          ))}


          {loading && <LoadingSkeleton />}
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 lg:px-12 py-4 lg:py-5 border-t border-border/50 glass sticky bottom-0">
        <form onSubmit={ask} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 lg:gap-3 bg-input/40 border border-border rounded-full px-3 lg:px-4 py-2.5 lg:py-3 shadow-elegant focus-within:ring-2 focus-within:ring-ring transition">

            {/* Text input */}
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />

            {/* Mic icon */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={loading || speaking}
              className={`p-1.5 rounded-full transition disabled:opacity-40 ${listening ? "text-primary animate-pulse" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Voice button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${listening
                ? "border-primary text-primary bg-primary/10 animate-pulse"
                : voiceEnabled
                  ? "border-primary/30 text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
                }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{listening ? "Stop" : "Voice"}</span>
            </button>

            {/* Send button - only shows when text is entered */}
            {question.trim() && (
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-primary text-primary-foreground p-2 rounded-full shadow-glow disabled:opacity-40 transition hover:scale-105"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {listening && (
            <p className="text-center text-xs text-primary mt-2 animate-pulse">
              🎤 Recording… release to send
            </p>
          )}
          {speaking && (
            <p className="text-center text-xs text-muted-foreground mt-2 animate-pulse">
              🔊 Speaking…
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function QAExchange({ item }: { item: QAItem }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(item.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex justify-end">
        <div className="bg-gradient-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-glow text-sm">
          {item.question}
        </div>
      </div>
      <div className="glass-strong rounded-2xl rounded-tl-md p-5 shadow-elegant">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-primary">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DocIntel AI</span>
        </div>
        <div className="text-sm leading-relaxed">
          <FormattedText text={item.displayed} />
          {!item.done && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 align-middle animate-pulse" />}
        </div>
        {item.done && item.sources.length > 0 && (
          <SourcesCollapsible sources={item.sources} />
        )}
        {item.done && (
          <button
            onClick={copy}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            {copied ? <><Check className="h-3 w-3 text-success" /> Copied</> : <><Copy className="h-3 w-3" /> Copy answer</>}
          </button>
        )}
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-xl text-xs my-2"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="glass-strong rounded-2xl p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Thinking…</span>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted/60 rounded animate-pulse w-full" />
        <div className="h-3 bg-muted/60 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
}
function VoiceListeningOverlay({ listening, question }: { listening: boolean; question: string }) {
  if (!listening) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 animate-fade-in-up">
      {/* Animated waves */}
      <div className="relative flex items-center justify-center mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="mx-1 bg-primary rounded-full animate-pulse"
            style={{
              width: "6px",
              height: `${20 + Math.sin(i * 0.8) * 30}px`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
      <p className="text-lg font-medium text-primary mb-2">Listening…</p>
      {question && (
        <p className="text-sm text-muted-foreground max-w-sm text-center px-4">
          "{question}"
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-4">Click mic again to stop</p>
    </div>
  );
}

function SourcesCollapsible({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <BookOpen className="h-3 w-3" />
        <span>{sources.length} source{sources.length > 1 ? "s" : ""} from document</span>
        <span className="ml-1">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-in-up">
          {sources.map((s, i) => (
            <span key={i} className="glass rounded-full px-2.5 py-0.5 text-[11px] text-muted-foreground border border-border/50">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}