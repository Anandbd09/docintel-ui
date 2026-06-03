import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Upload, Sparkles, Database, Cloud, Zap, ArrowRight, FileSearch } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocIntel AI — Ask Anything. From Any Document." },
      { name: "description", content: "Premium AI document intelligence. Upload PDFs and images, ask questions, get instant answers powered by RAG, Kafka, and AWS." },
      { property: "og:title", content: "DocIntel AI" },
      { property: "og:description", content: "Ask Anything. From Any Document." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Sparkles,
    title: "RAG Pipeline",
    desc: "Retrieval-augmented generation grounds every answer in your actual document content.",
  },
  {
    icon: Zap,
    title: "Kafka Processing",
    desc: "Stream-based ingestion pipeline handles documents at scale with millisecond latency.",
  },
  {
    icon: Cloud,
    title: "AWS S3 Storage",
    desc: "Enterprise-grade encrypted storage with global availability and 99.999999999% durability.",
  },
  {
    icon: Brain,
    title: "AI-Powered Answers",
    desc: "State-of-the-art language models deliver contextual, source-cited responses instantly.",
  },
];

function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-40 -right-40 h-[480px] w-[480px] rounded-full bg-primary-glow/15 blur-3xl animate-float-delayed" />

      <section className="relative px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-in-up">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Powered by RAG · Kafka · AWS
        </div>

        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Ask Anything.<br />
          From <span className="text-gradient">Any Document.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          DocIntel AI transforms your PDFs and images into a queryable knowledge base. Upload once, ask anything — get cited, contextual answers in seconds.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Link
            to="/upload"
            className="group inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl font-medium shadow-glow hover:opacity-90 transition"
          >
            <Upload className="h-4 w-4" />
            Upload Document
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 glass-strong px-6 py-3.5 rounded-xl font-medium hover:bg-accent/50 transition"
          >
            <FileSearch className="h-4 w-4" />
            Try Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {[
            { v: "99.9%", l: "Uptime" },
            { v: "<2s", l: "Avg Query" },
            { v: "∞", l: "Documents" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl px-4 py-3">
              <div className="text-2xl font-display font-bold text-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 lg:px-12 pb-16 sm:pb-24 lg:pb-32 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Capabilities</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Built on a modern AI stack</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group glass-strong rounded-2xl p-6 hover-lift animate-float"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-primary shadow-glow mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-8 border-t border-border/50 text-center text-xs text-muted-foreground">
        DocIntel AI · Crafted with precision
      </footer>
    </div>
  );
}
