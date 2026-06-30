import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { Save, Sparkles, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — coretex" }, { name: "description", content: "Update your display name, school level, and learning preferences." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setLevel(profile.school_level ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name, school_level: level })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  return (
    <PageContainer>
      <PageHeader title="Profile" subtitle="How coretex knows you." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-gradient-primary text-primary-foreground p-8 shadow-soft">
          <div className="w-20 h-20 rounded-2xl bg-white/20 grid place-items-center text-3xl font-bold mb-4">
            {(name || user.email || "?")[0].toUpperCase()}
          </div>
          <h2 className="font-display text-2xl font-bold">{name || "Your name"}</h2>
          <p className="text-primary-foreground/80 text-sm">{user.email}</p>
          <div className="mt-6 space-y-3">
            <Stat icon={<Sparkles className="w-4 h-4" />} label="XP" value={profile?.xp ?? 0} />
            <Stat icon={<Flame className="w-4 h-4" />} label="Streak" value={`${profile?.streak_days ?? 0} d`} />
            <Stat icon={<Trophy className="w-4 h-4" />} label="Level" value={profile?.level ?? 1} />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-8">
          <h3 className="font-bold text-lg mb-6">Account details</h3>
          <div className="grid gap-5">
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </Field>
            <Field label="School level">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none"
              >
                <option value="">Select level</option>
                <option>Junior High</option>
                <option>Senior High</option>
                <option>University</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Email">
              <input value={user.email ?? ""} disabled className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-muted-foreground" />
            </Field>

            <div className="flex justify-end">
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-primary-foreground/85 text-sm">{icon} {label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
