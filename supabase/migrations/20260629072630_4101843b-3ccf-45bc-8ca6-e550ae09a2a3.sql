
CREATE TABLE public.study_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'lobby',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_question int NOT NULL DEFAULT 0,
  question_started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_rooms TO authenticated;
GRANT ALL ON public.study_rooms TO service_role;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Any signed-in user can view rooms"
  ON public.study_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create rooms as themselves"
  ON public.study_rooms FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "Host can update their room"
  ON public.study_rooms FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "Host can delete their room"
  ON public.study_rooms FOR DELETE TO authenticated USING (host_id = auth.uid());

CREATE TRIGGER update_study_rooms_updated_at BEFORE UPDATE ON public.study_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  score int NOT NULL DEFAULT 0,
  last_answer_index int,
  last_answered_question int DEFAULT -1,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_participants TO authenticated;
GRANT ALL ON public.room_participants TO service_role;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view participants"
  ON public.room_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join as themselves"
  ON public.room_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own participant row"
  ON public.room_participants FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave"
  ON public.room_participants FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.study_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER TABLE public.study_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_participants REPLICA IDENTITY FULL;
