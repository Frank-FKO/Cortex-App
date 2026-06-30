import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader, EmptyState, StatCard } from "@/lib/page-utils";
import { generateQuiz, type QuizQuestion } from "@/lib/quiz-generator.functions";
import {
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
  Loader2,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — coretex" }, { name: "description", content: "Generate AI quizzes on any topic and review past attempts." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: QuizzesPage,
});

type Phase = "setup" | "taking" | "review";

function QuizzesPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const generateFn = useServerFn(generateQuiz);

  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] =
    useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [count, setCount] = useState(10);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  const { data: attempts } = useQuery({
    queryKey: ["quiz_attempts", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const avg =
    attempts && attempts.length
      ? (
          attempts.reduce((a, b) => a + Number(b.score ?? 0), 0) /
          attempts.length
        ).toFixed(0) + "%"
      : "—";

  const correctCount = answers.reduce(
    (acc, a, i) => acc + (a === questions[i]?.correct_index ? 1 : 0),
    0
  );
  const score = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    setLoading(true);
    try {
      const res = await generateFn({
        data: { topic: topic.trim(), difficulty, count, notes: notes.trim() || undefined },
      });
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(-1));
      setCurrent(0);
      setPhase("taking");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const correct = answers.reduce(
      (acc, a, i) => acc + (a === questions[i].correct_index ? 1 : 0),
      0
    );
    const finalScore = Math.round((correct / questions.length) * 100);
    setPhase("review");
    try {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        topic,
        questions: questions as unknown as never,
        answers: answers as unknown as never,
        score: finalScore,
        total_questions: questions.length,
        correct_count: correct,
      });
      qc.invalidateQueries({ queryKey: ["quiz_attempts", user.id] });
    } catch {
      // ignore — review still shown
    }
  }

  function reset() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setTopic("");
    setNotes("");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Quizzes"
        subtitle="Tell coretex what you want to be tested on — get a tailored quiz in seconds."
        action={
          phase !== "setup" ? (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-card border border-border text-sm font-semibold hover:bg-muted transition"
            >
              <RotateCcw className="w-4 h-4" /> New quiz
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Attempts"
          value={attempts?.length ?? 0}
          icon={<ListChecks className="w-4 h-4" />}
        />
        <StatCard
          label="Average score"
          value={avg}
          icon={<Target className="w-4 h-4" />}
          accent
        />
        <StatCard
          label="Last score"
          value={attempts?.[0] ? `${attempts[0].score ?? 0}%` : "—"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {phase === "setup" && (
        <div className="rounded-3xl bg-card border border-border p-8 mb-8 shadow-soft">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate a quiz</h2>
              <p className="text-sm text-muted-foreground">
                Enter a topic, pick difficulty, and coretex will craft questions for you.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Topic</span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Pythagorean theorem, French Revolution"
                className="h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as typeof difficulty)
                  }
                  className="h-11 px-3 rounded-xl bg-background border border-border text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Number of questions: {count}
                </span>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="accent-primary"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Extra notes <span className="text-muted-foreground">(optional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Focus areas, grade level, things to emphasize…"
                className="px-4 py-3 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="h-12 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate quiz
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {phase === "taking" && questions[current] && (
        <div className="rounded-3xl bg-card border border-border p-8 mb-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Question {current + 1} of {questions.length}
            </span>
            <div className="flex-1 mx-4 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{topic}</span>
          </div>

          <h3 className="text-xl font-bold mb-6 leading-snug">
            {questions[current].question}
          </h3>

          <div className="grid gap-3 mb-8">
            {questions[current].options.map((opt, i) => {
              const selected = answers[current] === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[current] = i;
                    setAnswers(next);
                  }}
                  className={`text-left px-5 py-4 rounded-2xl border transition ${
                    selected
                      ? "border-primary bg-primary/10 shadow-soft"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold mr-3">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="h-10 px-5 rounded-full border border-border text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                disabled={answers[current] === -1}
                className="h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answers.some((a) => a === -1)}
                className="h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
              >
                Submit quiz
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="space-y-6 mb-8">
          <div className="rounded-3xl bg-gradient-primary text-primary-foreground p-8 shadow-glow">
            <p className="text-sm opacity-80 font-semibold uppercase tracking-wider">
              Your score
            </p>
            <p className="text-6xl font-black mt-1">{score}%</p>
            <p className="text-sm opacity-90 mt-2">
              {correctCount} of {questions.length} correct on {topic}
            </p>
          </div>

          {questions.map((q, i) => {
            const userAns = answers[i];
            const isRight = userAns === q.correct_index;
            return (
              <div
                key={i}
                className="rounded-3xl bg-card border border-border p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full grid place-items-center text-white shrink-0 ${
                      isRight ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isRight ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                  <h4 className="font-bold leading-snug">
                    {i + 1}. {q.question}
                  </h4>
                </div>
                <div className="grid gap-2 mb-3">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct_index;
                    const isUser = oi === userAns;
                    return (
                      <div
                        key={oi}
                        className={`px-4 py-2.5 rounded-xl text-sm border ${
                          isCorrect
                            ? "border-green-500/40 bg-green-500/10"
                            : isUser
                              ? "border-red-500/40 bg-red-500/10"
                              : "border-border"
                        }`}
                      >
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                        {isCorrect && (
                          <span className="ml-2 text-xs font-semibold text-green-600">
                            Correct
                          </span>
                        )}
                        {isUser && !isCorrect && (
                          <span className="ml-2 text-xs font-semibold text-red-600">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
                  <strong className="text-foreground">Why:</strong>{" "}
                  {q.explanation}
                </p>
              </div>
            );
          })}

          <button
            onClick={reset}
            className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Generate another quiz
          </button>
        </div>
      )}

      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Past attempts
      </h3>
      {!attempts || attempts.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-7 h-7" />}
          title="No quizzes yet"
          description="Generate your first quiz above to see results here."
        />
      ) : (
        <div className="rounded-3xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-6 py-3">Topic</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Questions</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-6 py-4 font-medium">{a.topic ?? "—"}</td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {a.score ?? 0}%
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {a.correct_count ?? 0}/{a.total_questions ?? 0}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
