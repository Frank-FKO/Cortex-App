import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Trophy, Brain, Target, ArrowRight, Sparkles, Clock, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader, StatCard } from "@/lib/page-utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — coretex" }, { name: "description", content: "Your daily learning hub: XP, streaks, AI tutor, and next lessons." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").limit(4);
      return data ?? [];
    },
  });

  const greet = profile?.display_name ?? user.email?.split("@")[0] ?? "learner";

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${greet} 👋`}
        subtitle="Here's your learning snapshot for today."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Current XP" value={profile?.xp ?? 0} hint={`Level ${profile?.level ?? 1}`} icon={<Sparkles className="w-4 h-4" />} accent />
        <StatCard label="Streak" value={`${profile?.streak_days ?? 0} days`} hint="Keep it going 🔥" icon={<Flame className="w-4 h-4" />} />
        <StatCard label="Mastery" value="—" hint="Start a lesson" icon={<Brain className="w-4 h-4" />} />
        <StatCard label="Rank" value="—" hint="Take a quiz to rank" icon={<Trophy className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-gradient-primary p-8 text-primary-foreground relative overflow-hidden shadow-soft">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/15 rounded-full blur-3xl" />
            <Sparkles className="w-6 h-6 mb-3" />
            <h2 className="font-display text-2xl font-bold mb-2">Ask coretex anything</h2>
            <p className="text-primary-foreground/85 mb-5 max-w-md">
              Stuck on a concept? Need a quick example? Your AI tutor is one tap away.
            </p>
            <Link
              to="/ai-tutor"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-background text-foreground font-semibold text-sm hover:scale-105 transition"
            >
              Start a session <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Your subjects</h3>
              <Link to="/subjects" className="text-sm text-primary font-semibold hover:underline">
                See all
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(subjects ?? []).map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-border hover:border-primary/40 hover:shadow-soft transition cursor-pointer flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center text-white font-bold"
                    style={{ background: s.color ?? "#7C4DFF" }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold">Today's goal</h3>
            </div>
            <p className="text-3xl font-bold mb-1">30 min</p>
            <p className="text-sm text-muted-foreground mb-4">of focused study</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[12%] bg-gradient-primary rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 / 30 minutes</p>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-bold">Up next</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: BookOpen, title: "Continue: Algebra basics", time: "12 min left" },
                { icon: Brain, title: "Revise: Cell biology", time: "Due today" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
