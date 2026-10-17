-- 0121: the build models are named by what they are, not by brand.
--
-- The three models seeded in 0116 read "Qwen on the Mac mini", "Claude Opus"
-- and "Fable"; they become "Local model", "Standard cloud model" and
-- "Advanced cloud model". Only a label still holding its seeded name is
-- renamed, so a name an administrator has since chosen is kept.
--
-- Changes three labels and nothing else. Safe to run twice.

begin;

update public.build_models set label = 'Local model', updated_at = now()
where model_id = 'qwen-local' and label = 'Qwen on the Mac mini';

update public.build_models set label = 'Standard cloud model', updated_at = now()
where model_id = 'claude-opus' and label = 'Claude Opus';

update public.build_models set label = 'Advanced cloud model', updated_at = now()
where model_id = 'claude-fable' and label = 'Fable';

commit;
