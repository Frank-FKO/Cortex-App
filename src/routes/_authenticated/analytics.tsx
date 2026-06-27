import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader, StatCard } from "@/lib/page-utils";
import { TrendingUp, Brain, Flame, Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Cortex" }] }),
  component: AnalyticsPage,
});

const trend = [
  { d: "Mon", v: 20 }, { d: "Tue", v: 35 }, { d: "Wed", v: 28 },
  { d: "Thu", v: 52 }, { d: "Fri", v: 48 }, { d: "Sat", v: 65 }, { d: "Sun", v: 72 },
];
const mastery = [
  { s: "Math", m: 82 }, { s: "Physics", m: 64 }, { s: "Bio", m: 71 },
  { s: "Chem", m: 55 }, { s: "Eng", m: 88 },
];

function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader title="Analytics" subtitle="See yourself getting smarter — week by week." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Minutes this week" value="148" hint="+22% vs last week" icon={<Clock className="w-4 h-4" />} accent />
        <StatCard label="Retention" value="78%" hint="+6 pts" icon={<Brain className="w-4 h-4" />} />
        <StatCard label="Streak" value="12 d" icon={<Flame className="w-4 h-4" />} />
        <StatCard label="Quiz avg" value="84%" hint="+4 pts" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-border p-6">
          <h3 className="font-bold mb-1">Study minutes</h3>
          <p className="text-sm text-muted-foreground mb-4">Last 7 days</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 275)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.025 270)" />
                <YAxis stroke="oklch(0.5 0.025 270)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.015 275)" }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.58 0.24 285)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6">
          <h3 className="font-bold mb-1">Mastery by subject</h3>
          <p className="text-sm text-muted-foreground mb-4">% mastered</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={mastery}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.015 275)" />
                <XAxis dataKey="s" stroke="oklch(0.5 0.025 270)" />
                <YAxis stroke="oklch(0.5 0.025 270)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.015 275)" }} />
                <Bar dataKey="m" fill="oklch(0.58 0.24 285)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
