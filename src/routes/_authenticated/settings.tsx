import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { Bell, Moon, Globe, Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Cortex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const groups = [
    {
      icon: Bell,
      title: "Notifications",
      items: [
        { label: "Daily study reminders", on: true },
        { label: "Quiz results", on: true },
        { label: "Leaderboard updates", on: false },
      ],
    },
    {
      icon: Moon,
      title: "Appearance",
      items: [{ label: "Dark mode", on: false }, { label: "Reduced motion", on: false }],
    },
    {
      icon: Globe,
      title: "Language & region",
      items: [{ label: "English (US)", on: true }],
    },
    {
      icon: Shield,
      title: "Privacy",
      items: [{ label: "Anonymous on leaderboard", on: false }],
    },
  ];
  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Make Cortex feel like yours." />

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {groups.map((g) => (
          <div key={g.title} className="rounded-3xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <g.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold">{g.title}</h3>
            </div>
            <div className="space-y-3">
              {g.items.map((it) => (
                <div key={it.label} className="flex items-center justify-between py-2">
                  <span className="text-sm">{it.label}</span>
                  <div
                    className={`w-10 h-6 rounded-full p-0.5 transition ${
                      it.on ? "bg-gradient-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition ${
                        it.on ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/5 font-semibold transition"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </PageContainer>
  );
}
