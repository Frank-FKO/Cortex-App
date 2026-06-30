import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { CalendarDays, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "Study Planner — coretex" }, { name: "description", content: "Plan your week with AI-suggested lessons and quiz sessions." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: PlannerPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function PlannerPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Study Planner"
        subtitle="coretex builds a plan around your goals, exam dates, and how you learn."
        action={
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition">
            <Plus className="w-4 h-4" /> New plan
          </button>
        }
      />

      <div className="grid lg:grid-cols-7 gap-3">
        {days.map((d, i) => (
          <div key={d} className="rounded-2xl bg-card border border-border p-4 min-h-48">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold">{d}</span>
              <span className="text-xs text-muted-foreground">{i + 1}</span>
            </div>
            {i === 0 && (
              <div className="rounded-lg p-2 bg-primary/10 text-primary text-xs font-semibold mb-2">
                Algebra · 30m
              </div>
            )}
            {i === 2 && (
              <div className="rounded-lg p-2 bg-[oklch(0.82_0.13_215)]/15 text-[oklch(0.45_0.13_215)] text-xs font-semibold mb-2">
                Revision · 15m
              </div>
            )}
            {i > 3 && (
              <div className="text-muted-foreground text-xs flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Free
              </div>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
