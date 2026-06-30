import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader } from "@/lib/page-utils";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/subjects")({
  head: () => ({ meta: [{ title: "Subjects — Cortex" }, { name: "description", content: "Browse subjects and track your mastery across the Cortex catalog." }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data: subjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      return data ?? [];
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Subjects"
        subtitle="Pick a subject to start learning. Cortex adapts to your level automatically."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(subjects ?? []).map((s) => (
          <div
            key={s.id}
            className="group rounded-3xl bg-card border border-border p-6 hover:border-primary/40 hover:shadow-soft transition cursor-pointer"
          >
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center text-white font-bold text-xl mb-4 group-hover:scale-110 transition"
              style={{ background: s.color ?? "#7C4DFF" }}
            >
              {s.name[0]}
            </div>
            <h3 className="font-bold text-lg mb-1">{s.name}</h3>
            <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{s.description}</p>
            <div className="flex items-center text-sm font-semibold text-primary">
              Start learning <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
