import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader, EmptyState } from "@/lib/page-utils";
import { GraduationCap, Plus, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lessons")({
  head: () => ({ meta: [{ title: "Lessons — Cortex" }] }),
  component: LessonsPage,
});

function LessonsPage() {
  const { user } = Route.useRouteContext();
  const { data: lessons } = useQuery({
    queryKey: ["lessons", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Lessons"
        subtitle="AI-generated, personalized to your level and goals."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition">
            <Plus className="w-4 h-4" /> Generate lesson
          </button>
        }
      />

      {!lessons || lessons.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-7 h-7" />}
          title="No lessons yet"
          description="Tell Cortex a topic and it will craft a lesson that adapts to your level."
          action={
            <button className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft">
              <Plus className="w-4 h-4" /> Create your first lesson
            </button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((l) => (
            <div key={l.id} className="rounded-3xl bg-card border border-border p-6 hover:border-primary/40 transition cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{l.title}</h3>
                {l.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{l.summary || l.topic}</p>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
