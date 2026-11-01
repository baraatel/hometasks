ALTER TABLE public.tasks ADD COLUMN base_lang text NOT NULL DEFAULT 'en';
ALTER TABLE public.tasks ADD COLUMN title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.tasks SET title_i18n = jsonb_strip_nulls(jsonb_build_object('en', title, 'ar', NULLIF(title_ar, '')));
COMMENT ON COLUMN public.tasks.title_ar IS 'DEPRECATED: replaced by title_i18n';