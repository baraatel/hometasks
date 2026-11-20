CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  emoji TEXT NOT NULL DEFAULT '📋',
  recurrence_type TEXT NOT NULL DEFAULT 'daily',
  recurrence_days INT[] NOT NULL DEFAULT '{}',
  once_date DATE,
  scheduled_time TIME,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tasks TO anon, authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view current tasks" ON public.tasks FOR SELECT TO anon, authenticated
  USING (recurrence_type <> 'once' OR once_date >= CURRENT_DATE - 1);

CREATE TABLE public.task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(task_id, log_date)
);
GRANT SELECT, INSERT, UPDATE ON public.task_logs TO anon, authenticated;
GRANT ALL ON public.task_logs TO service_role;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view recent logs" ON public.task_logs FOR SELECT TO anon, authenticated
  USING (log_date >= CURRENT_DATE - 7 AND log_date <= CURRENT_DATE + 7);
CREATE POLICY "tick recent tasks" ON public.task_logs FOR INSERT TO anon, authenticated
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);
CREATE POLICY "untick recent tasks" ON public.task_logs FOR UPDATE TO anon, authenticated
  USING (log_date BETWEEN current_date - 1 AND current_date + 1)
  WITH CHECK (log_date BETWEEN current_date - 1 AND current_date + 1);

ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_logs;

INSERT INTO public.tasks (title, title_ar, emoji, recurrence_type, recurrence_days, scheduled_time, sort_order) VALUES
('Dishwashing & Kitchen','غسيل الصحون والمطبخ','🍽️','daily','{}','09:00',1),
('Floor Mopping','مسح وتنظيف الأرضيات','🧹','daily','{}','10:00',2),
('Laundry','غسيل الملابس','🧺','weekly','{0,3}','11:00',3),
('Water Plants','سقي الزرع','🪴','weekly','{1,4}','17:00',4),
('Bathroom Cleaning','تنظيف الحمام','🚿','weekly','{6}','12:00',5);