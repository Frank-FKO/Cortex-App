
-- 1) Track total questions on the room (safe to expose) so clients don't need the questions column
ALTER TABLE public.study_rooms ADD COLUMN IF NOT EXISTS total_questions int NOT NULL DEFAULT 0;
UPDATE public.study_rooms SET total_questions = COALESCE(jsonb_array_length(questions), 0);

CREATE OR REPLACE FUNCTION public.sync_study_room_total_questions()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.total_questions := COALESCE(jsonb_array_length(NEW.questions), 0);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS sync_total_questions ON public.study_rooms;
CREATE TRIGGER sync_total_questions
BEFORE INSERT OR UPDATE OF questions ON public.study_rooms
FOR EACH ROW EXECUTE FUNCTION public.sync_study_room_total_questions();

-- 2) Hide the questions column from regular authenticated reads (host fetches via function)
REVOKE SELECT ON public.study_rooms FROM authenticated;
GRANT SELECT (
  id, code, name, topic, difficulty, status, host_id,
  current_question, question_started_at, total_questions,
  created_at, updated_at
) ON public.study_rooms TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.study_rooms TO authenticated;

-- 3) Server-side sanitized question reader
CREATE OR REPLACE FUNCTION public.get_active_room_question(p_room_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.study_rooms%ROWTYPE;
  q jsonb;
  is_host boolean;
  is_participant boolean;
  has_answered boolean;
BEGIN
  SELECT * INTO r FROM public.study_rooms WHERE id = p_room_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  is_host := r.host_id = auth.uid();
  is_participant := EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
  IF NOT (is_host OR is_participant) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  q := r.questions -> r.current_question;
  IF q IS NULL THEN RETURN NULL; END IF;

  SELECT (last_answered_question = r.current_question)
    INTO has_answered
  FROM public.room_participants
  WHERE room_id = p_room_id AND user_id = auth.uid();

  IF is_host OR COALESCE(has_answered, false) OR r.status = 'finished' THEN
    RETURN q;
  END IF;

  -- Strip answer fields for participants who haven't answered yet
  RETURN q - 'correct_index' - 'explanation';
END; $$;

REVOKE ALL ON FUNCTION public.get_active_room_question(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_room_question(uuid) TO authenticated;

-- 4) Server-side answer submission (prevents score tampering)
CREATE OR REPLACE FUNCTION public.submit_room_answer(p_room_id uuid, p_answer_index int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.study_rooms%ROWTYPE;
  q jsonb;
  correct_idx int;
  is_correct boolean;
  part public.room_participants%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.study_rooms WHERE id = p_room_id;
  IF NOT FOUND OR r.status <> 'active' THEN
    RAISE EXCEPTION 'Room not active';
  END IF;

  SELECT * INTO part FROM public.room_participants
  WHERE room_id = p_room_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;

  IF part.last_answered_question IS NOT NULL
     AND part.last_answered_question = r.current_question THEN
    RAISE EXCEPTION 'Already answered this question';
  END IF;

  q := r.questions -> r.current_question;
  correct_idx := (q ->> 'correct_index')::int;
  is_correct := p_answer_index = correct_idx;

  UPDATE public.room_participants
    SET last_answer_index = p_answer_index,
        last_answered_question = r.current_question,
        score = score + CASE WHEN is_correct THEN 100 ELSE 0 END
  WHERE id = part.id;

  RETURN jsonb_build_object(
    'is_correct', is_correct,
    'correct_index', correct_idx,
    'explanation', q ->> 'explanation'
  );
END; $$;

REVOKE ALL ON FUNCTION public.submit_room_answer(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_room_answer(uuid, int) TO authenticated;

-- 5) Remove direct UPDATE on room_participants so score can't be set client-side.
-- All in-game mutations now flow through submit_room_answer (SECURITY DEFINER).
DROP POLICY IF EXISTS "Users can update their own participant row" ON public.room_participants;
