import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { generateQuiz } from "@/lib/quiz-generator.functions";
import { PageHeader } from "@/lib/page-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Users, Plus, LogIn, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/study-room")({
  head: () => ({
    meta: [
      { title: "Study Rooms — Cortex" },
      { name: "description", content: "Create or join real-time multiplayer AI quiz rooms with friends." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudyRoomPage,
  errorComponent: ({ error }) => <div className="p-6 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

type Room = {
  id: string;
  code: string;
  name: string;
  topic: string;
  status: string;
  host_id: string;
  created_at: string;
};

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function StudyRoomPage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateQuiz);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [count, setCount] = useState(5);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("study_rooms")
      .select("id, code, name, topic, status, host_id, created_at")
      .in("status", ["lobby", "active"])
      .order("created_at", { ascending: false })
      .limit(30);
    setRooms((data as Room[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("rooms-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "study_rooms" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || !name.trim()) return toast.error("Add a name and topic");
    setCreating(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error("Not signed in");

      toast.info("Generating quiz with AI…");
      const { questions } = await generate({ data: { topic, difficulty, count } });

      const code = randomCode();
      const { data: room, error } = await supabase
        .from("study_rooms")
        .insert({
          code,
          host_id: user.id,
          name,
          topic,
          difficulty,
          questions: questions as never,
          status: "lobby",
        })
        .select()
        .single();
      if (error) throw error;

      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Host";
      await supabase.from("room_participants").insert({
        room_id: room.id,
        user_id: user.id,
        display_name: displayName,
      });

      toast.success(`Room created! Code: ${code}`);
      navigate({ to: "/study-room/$roomId", params: { roomId: room.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  async function joinByCode(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const { data: room, error } = await supabase
        .from("study_rooms")
        .select("id")
        .eq("code", joinCode.trim().toUpperCase())
        .maybeSingle();
      if (error) throw error;
      if (!room) throw new Error("Room not found");
      await joinRoom(room.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  async function joinRoom(roomId: string) {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Player";
    await supabase
      .from("room_participants")
      .upsert(
        { room_id: roomId, user_id: user.id, display_name: displayName },
        { onConflict: "room_id,user_id" }
      );
    navigate({ to: "/study-room/$roomId", params: { roomId } });
  }

  async function deleteRoom(id: string) {
    if (!confirm("Delete this room?")) return;
    const { error } = await supabase.from("study_rooms").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Room deleted");
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <PageHeader
        title="Study Rooms"
        subtitle="Create a live AI quiz room and invite friends to compete in real time."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Create a room</CardTitle>
            <CardDescription>AI generates the quiz, you share the code.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRoom} className="space-y-3">
              <div>
                <Label>Room name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friday night physics" />
              </div>
              <div>
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Newton's laws of motion" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Questions</Label>
                  <Input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : "Create room"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5" /> Join with a code</CardTitle>
            <CardDescription>Enter the 6-character room code from a friend.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={joinByCode} className="space-y-3">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="text-center text-2xl tracking-[0.4em] font-mono uppercase"
              />
              <Button type="submit" disabled={joining || joinCode.length < 4} className="w-full" variant="secondary">
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" /> Open rooms
        </h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : rooms.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No rooms yet — be the first to host one.</CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((r) => (
              <Card key={r.id} className="group hover:border-primary/50 transition">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{r.topic}</div>
                    </div>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-1 rounded ${r.status === "lobby" ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500"}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="font-mono text-sm tracking-widest text-muted-foreground">{r.code}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => joinRoom(r.id)}>Join</Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/study-room/$roomId" params={{ roomId: r.id }}>View</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteRoom(r.id)} title="Delete (host only)">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
