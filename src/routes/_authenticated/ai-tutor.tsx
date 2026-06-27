import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, Brain, BookOpen, Lightbulb, ListChecks } from "lucide-react";
import { PageContainer } from "@/lib/page-utils";

export const Route = createFileRoute("/_authenticated/ai-tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — Cortex" }] }),
  component: AITutor,
});

type Msg = { role: "user" | "assistant"; content: string };

function AITutor() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setMessages((m) => [
      ...m,
      { role: "user", content },
      {
        role: "assistant",
        content:
          "I'm ready to help! Connect your AI key and I'll start tutoring on any topic — with examples, practice questions and follow-ups tuned to how you learn.",
      },
    ]);
    setInput("");
  };

  const suggestions = [
    { icon: BookOpen, label: "Explain photosynthesis simply" },
    { icon: Lightbulb, label: "Quiz me on quadratic equations" },
    { icon: ListChecks, label: "Make 10 flashcards on World War II" },
    { icon: Brain, label: "Walk me through Newton's 3rd law" },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col h-[calc(100vh-9rem)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Tutor</h1>
            <p className="text-sm text-muted-foreground">Ask anything. Learn deeply.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-3xl bg-card border border-border p-6 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary grid place-items-center mb-5 shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">How can I help you learn today?</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Try one of these, or type your own question below.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.label)}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-soft transition text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      m.role === "user"
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 items-end"
        >
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-4 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Cortex anything…"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft hover:shadow-glow transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
