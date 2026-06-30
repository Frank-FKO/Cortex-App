import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { Award, Flame, Brain, Trophy, Star, Target, Zap, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Cortex" }, { name: "description", content: "Unlock badges and milestones as you build study streaks on Cortex." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AchievementsPage,
});

const badges = [
  { icon: Flame, title: "First Spark", desc: "Complete your first session", unlocked: true },
  { icon: Brain, title: "Quick Learner", desc: "Finish 5 lessons", unlocked: false },
  { icon: Trophy, title: "Quiz Champion", desc: "Score 100% on any quiz", unlocked: false },
  { icon: Star, title: "Bright Mind", desc: "Reach Level 5", unlocked: false },
  { icon: Target, title: "Sharp Shooter", desc: "10 quizzes above 80%", unlocked: false },
  { icon: Zap, title: "On Fire", desc: "7-day streak", unlocked: false },
  { icon: BookOpen, title: "Bookworm", desc: "Read 25 lessons", unlocked: false },
  { icon: Award, title: "Cortex Master", desc: "Reach Level 20", unlocked: false },
];

function AchievementsPage() {
  return (
    <PageContainer>
      <PageHeader title="Achievements" subtitle="Milestones that mark real progress." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {badges.map((b) => (
          <div
            key={b.title}
            className={`rounded-3xl p-6 border text-center ${
              b.unlocked
                ? "bg-card border-border shadow-soft"
                : "bg-card/40 border-dashed border-border opacity-60"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-4 ${
                b.unlocked ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              <b.icon className="w-7 h-7" />
            </div>
            <h3 className="font-bold">{b.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
            {!b.unlocked && <div className="text-xs text-muted-foreground mt-3">🔒 Locked</div>}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
