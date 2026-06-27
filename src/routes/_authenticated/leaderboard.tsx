import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { Trophy, Crown, Medal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Cortex" }] }),
  component: LeaderboardPage,
});

const board = [
  { rank: 1, name: "Ama K.", xp: 9840, level: 12 },
  { rank: 2, name: "Daniel O.", xp: 8720, level: 11 },
  { rank: 3, name: "Priya S.", xp: 8410, level: 11 },
  { rank: 4, name: "Kojo M.", xp: 7220, level: 10 },
  { rank: 5, name: "Lina A.", xp: 6890, level: 9 },
  { rank: 6, name: "Tunde B.", xp: 6310, level: 9 },
  { rank: 7, name: "You", xp: 0, level: 1, me: true },
];

function LeaderboardPage() {
  return (
    <PageContainer>
      <PageHeader title="Leaderboard" subtitle="This week's top learners. Climb by being consistent." />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {board.slice(0, 3).map((p, i) => {
          const Icon = i === 0 ? Crown : i === 1 ? Trophy : Medal;
          const grad = i === 0 ? "from-amber-300 to-orange-500" : i === 1 ? "from-slate-300 to-slate-500" : "from-orange-400 to-amber-700";
          return (
            <div key={p.name} className={`rounded-3xl bg-gradient-to-br ${grad} p-6 text-white shadow-soft`}>
              <Icon className="w-7 h-7 mb-3" />
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">#{p.rank}</div>
              <div className="font-display text-2xl font-bold">{p.name}</div>
              <div className="text-sm opacity-90 mt-1">{p.xp.toLocaleString()} XP · Lv {p.level}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl bg-card border border-border overflow-hidden">
        {board.map((p) => (
          <div
            key={p.name}
            className={`flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 ${
              p.me ? "bg-primary/5" : ""
            }`}
          >
            <div className="w-8 text-center font-bold text-muted-foreground">{p.rank}</div>
            <div className="w-10 h-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold">
              {p.name[0]}
            </div>
            <div className="flex-1 font-semibold">{p.name}</div>
            <div className="text-sm text-muted-foreground">Lv {p.level}</div>
            <div className="font-bold text-primary w-24 text-right">{p.xp.toLocaleString()} XP</div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
