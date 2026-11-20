-- Migration 0004: Remediate lov_db_rls_tautology_permissive_v1 findings
-- Explicitly drop legacy permissive tautology policies
DROP POLICY IF EXISTS "household access tasks" ON public.tasks;
DROP POLICY IF EXISTS "household access logs" ON public.task_logs;
DROP POLICY IF EXISTS "anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "anyone can view logs" ON public.task_logs;

-- Re-verify and enforce scoped least-privilege policies
DROP POLICY IF EXISTS "view current tasks" ON public.tasks;
CREATE POLICY "view current tasks" ON public.tasks FOR SELECT TO anon, authenticated
  USING (recurrence_type <> 'once' OR once_date >= CURRENT_DATE - 1);

DROP POLICY IF EXISTS "view recent logs" ON public.task_logs;
CREATE POLICY "view recent logs" ON public.task_logs FOR SELECT TO anon, authenticated
  USING (log_date >= CURRENT_DATE - 7 AND log_date <= CURRENT_DATE + 7);

DROP POLICY IF EXISTS "tick recent tasks" ON public.task_logs;
CREATE POLICY "tick recent tasks" ON public.task_logs FOR INSERT TO anon, authenticated
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);

DROP POLICY IF EXISTS "untick recent tasks" ON public.task_logs;
CREATE POLICY "untick recent tasks" ON public.task_logs FOR UPDATE TO anon, authenticated
  USING (log_date BETWEEN current_date - 1 AND current_date + 1)
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);
