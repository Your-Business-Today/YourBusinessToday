-- 0123: the raised-anyway review is withdrawn.
--
-- The similar-task check compared whole story sentences across every project a
-- person could see, so two ordinary words in common matched unrelated tasks, and
-- raising anyway posted a keep, merge or replace question on each lookalike task to
-- its raiser, naming a task from another project. The check is now a same-project
-- "does this exist already?" check with a confirm turn, and nobody is asked
-- anything. Every question still waiting on an answer is removed, with its
-- notifications (they cascade from the message); the reviews already answered stay
-- as history. The two review functions go.
--
-- Safe to re-run.

begin;

delete from public.conversation_messages as message
using public.similar_task_reviews as review
where review.decision is null
	and message.task_id = review.existing_task_id
	and message.body like '% (review id: ' || review.id::text || ')';

delete from public.similar_task_reviews where decision is null;

drop function if exists public.answer_similar_task_review(uuid, text, uuid);
drop function if exists public.close_reviewed_task(uuid, uuid);

commit;

notify pgrst, 'reload schema';
