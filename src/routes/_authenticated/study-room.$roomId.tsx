import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Trophy, Copy, ArrowLeft, Check, X, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/study-room/$roomId")({
  component: RoomPage,
  errorComponent: ({ error }) => <div className="p-6 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Room not found</div>,
});

type Question = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};
type Room = {
  id: string;
  code: string;
  name: string;
  topic: string;
  status: "lobby" | "active" | "finished";
  host_id: string;
  questions: Question[];
  current_question: number;
};
type Participant = {
  id: string;
  user_id: string;
  display_name: string;
  score: number;
  last_answer_index: number | null;
  last_answered_question: number | null;
};

function RoomPage() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function loadRoom() {
    const { data } = await supabase.from("study_rooms").select("*").eq("id", roomId).maybeSingle();
    if (data) setRoom(data as unknown as Room);
  }
  async function loadParticipants() {
    const { data } = await supabase.from("room_participants").select("*").eq("room_id", roomId).order("score", { ascending: false });
    setParticipants((data as Participant[]) ?? []);
  }

  useEffect(() => {
    loadRoom();
    loadParticipants();
    const ch = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "study_rooms", filter: `id=eq.${roomId}` }, loadRoom)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${roomId}` }, loadParticipants)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Reset picked answer when question changes
  useEffect(() => {
    setPicked(null);
  }, [room?.current_question, room?.status]);

  const isHost = room && userId && room.host_id === userId;
  const me = useMemo(() => participants.find((p) => p.user_id === userId), [participants, userId]);
  const current: Question | undefined = room?.questions?.[room.current_question];
  const answeredThis = me && me.last_answered_question === room?.current_question;

  async function startQuiz() {
    if (!room) return;
    const { error } = await supabase
      .from("study_rooms")
      .update({ status: "active", current_question: 0, question_started_at: new Date().toISOString() })
      .eq("id", room.id);
    if (error) toast.error(error.message);
  }

  async function nextQuestion() {
    if (!room) return;
    const next = room.current_question + 1;
    if (next >= room.questions.length) {
      await supabase.from("study_rooms").update({ status: "finished" }).eq("id", room.id);
    } else {
      await supabase
        .from("study_rooms")
        .update({ current_question: next, question_started_at: new Date().toISOString() })
        .eq("id", room.id);
    }
  }

  async function submitAnswer(idx: number) {
    if (!room || !current || !me || answeredThis) return;
    setPicked(idx);
    const isCorrect = idx === current.correct_index;
    const newScore = me.score + (isCorrect ? 100 : 0);
    const { error } = await supabase
      .from("room_participants")
      .update({
        last_answer_index: idx,
        last_answered_question: room.current_question,
        score: newScore,
      })
      .eq("id", me.id);
    if (error) toast.error(error.message);
  }

  async function leave() {
    if (me) await supabase.from("room_participants").delete().eq("id", me.id);
    navigate({ to: "/study-room" });
  }

  function copyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    toast.success("Code copied");
  }

  if (!room) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const totalQ = room.questions.length;
  const answeredCount = participants.filter((p) => p.last_answered_question === room.current_question).length;

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm"><Link to="/study-room"><ArrowLeft className="h-4 w-4 mr-1" /> All rooms</Link></Button>
          <h1 className="text-2xl font-bold mt-1">{room.name}</h1>
          <p className="text-sm text-muted-foreground">{room.topic}</p>
        </div>
        <div className="text-right">
          <button onClick={copyCode} className="flex items-center gap-2 font-mono text-lg tracking-widest bg-muted px-3 py-2 rounded hover:bg-muted/70">
            {room.code} <Copy className="h-4 w-4" />
          </button>
          <div className="text-xs text-muted-foreground mt-1">Share this code</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {room.status === "lobby" && (
            <Card>
              <CardHeader><CardTitle>Waiting room</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {participants.length} player{participants.length === 1 ? "" : "s"} joined. {totalQ} questions ready.
                </p>
                {isHost ? (
                  <Button onClick={startQuiz} size="lg" className="w-full" disabled={participants.length < 1}>
                    Start quiz
                  </Button>
                ) : (
                  <div className="text-center text-muted-foreground py-4">Waiting for the host to start…</div>
                )}
              </CardContent>
            </Card>
          )}

          {room.status === "active" && current && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {room.current_question + 1} / {totalQ}</span>
                  <span>{answeredCount} / {participants.length} answered</span>
                </div>
                <Progress value={((room.current_question + 1) / totalQ) * 100} />
                <CardTitle className="text-xl mt-4">{current.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {current.options.map((opt, i) => {
                  const showResult = answeredThis;
                  const correct = i === current.correct_index;
                  const chosen = (picked ?? me?.last_answer_index) === i;
                  return (
                    <button
                      key={i}
                      disabled={!!answeredThis}
                      onClick={() => submitAnswer(i)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition flex items-center gap-3
                        ${showResult && correct ? "border-green-500 bg-green-500/10" : ""}
                        ${showResult && chosen && !correct ? "border-red-500 bg-red-500/10" : ""}
                        ${!showResult ? "border-border hover:border-primary hover:bg-primary/5" : ""}
                        ${chosen && !showResult ? "border-primary bg-primary/10" : ""}
                      `}
                    >
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1">{opt}</span>
                      {showResult && correct && <Check className="h-5 w-5 text-green-500" />}
                      {showResult && chosen && !correct && <X className="h-5 w-5 text-red-500" />}
                    </button>
                  );
                })}
                {answeredThis && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded mt-3">
                    <strong>Explanation:</strong> {current.explanation}
                  </div>
                )}
                {isHost && (
                  <Button onClick={nextQuestion} className="w-full mt-4">
                    {room.current_question + 1 >= totalQ ? "Finish quiz" : "Next question →"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {room.status === "finished" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" /> Final results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {participants.map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-muted"}`}>
                    <span className="font-bold text-lg w-6">{i + 1}</span>
                    <span className="flex-1 font-medium">{p.display_name}</span>
                    <span className="font-mono font-bold">{p.score} pts</span>
                  </div>
                ))}
                {isHost && (
                  <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/study-room" })}>
                    Back to rooms
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Leaderboard</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  {p.user_id === room.host_id && <Crown className="h-3 w-3 text-yellow-500" />}
                  <span className="flex-1 truncate">{p.display_name}{p.user_id === userId && " (you)"}</span>
                  <span className="font-mono font-semibold">{p.score}</span>
                  {room.status === "active" && p.last_answered_question === room.current_question && (
                    <Check className="h-3 w-3 text-green-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Button variant="outline" size="sm" className="w-full" onClick={leave}>Leave room</Button>
        </div>
      </div>
    </div>
  );
}
