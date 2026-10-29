DROP POLICY "household access tasks" ON public.tasks;
DROP POLICY "household access logs" ON public.task_logs;
REVOKE INSERT, UPDATE, DELETE ON public.tasks FROM anon, authenticated;
REVOKE DELETE ON public.task_logs FROM anon, authenticated;

CREATE POLICY "anyone can view tasks" ON public.tasks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anyone can view logs" ON public.task_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tick recent tasks" ON public.task_logs FOR INSERT TO anon, authenticated
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);
CREATE POLICY "untick recent tasks" ON public.task_logs FOR UPDATE TO anon, authenticated
  USING (log_date BETWEEN current_date - 1 AND current_date + 1)
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);