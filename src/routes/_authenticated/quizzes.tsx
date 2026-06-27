import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader, EmptyState, StatCard } from "@/lib/page-utils";
import { ListChecks, Sparkles, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — Cortex" }] }),
  component: QuizzesPage,
});

function QuizzesPage() {
  const { user } = Route.useRouteContext();
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

  const avg = attempts && attempts.length
    ? (attempts.reduce((a, b) => a + Number(b.score ?? 0), 0) / attempts.length).toFixed(0) + "%"
    : "—";

  return (
    <PageContainer>
      <PageHeader
        title="Quizzes"
        subtitle="Test what you know. Get instant feedback. Build real confidence."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition">
            <Sparkles className="w-4 h-4" /> Generate quiz
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Attempts" value={attempts?.length ?? 0} icon={<ListChecks className="w-4 h-4" />} />
        <StatCard label="Average score" value={avg} icon={<Target className="w-4 h-4" />} accent />
        <StatCard label="Best streak" value="—" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {!attempts || attempts.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-7 h-7" />}
          title="No quizzes yet"
          description="Pick a topic and Cortex will generate questions tuned to your level."
        />
      ) : (
        <div className="rounded-3xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr><th className="px-6 py-3">Topic</th><th className="px-6 py-3">Score</th><th className="px-6 py-3">Date</th></tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-6 py-4 font-medium">{a.topic ?? "—"}</td>
                  <td className="px-6 py-4 font-bold text-primary">{a.score ?? 0}%</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
