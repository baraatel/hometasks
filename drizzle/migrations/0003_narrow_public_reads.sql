DROP POLICY IF EXISTS "anyone can view tasks" ON public.tasks;
CREATE POLICY "view current tasks" ON public.tasks FOR SELECT TO anon, authenticated
  USING (recurrence_type <> 'once' OR once_date >= CURRENT_DATE - 1);
DROP POLICY IF EXISTS "anyone can view logs" ON public.task_logs;
CREATE POLICY "view recent logs" ON public.task_logs FOR SELECT TO anon, authenticated
  USING (log_date >= CURRENT_DATE - 7 AND log_date <= CURRENT_DATE + 7);