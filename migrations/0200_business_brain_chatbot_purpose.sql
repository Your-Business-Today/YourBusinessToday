-- 0200: each chatbot of Your Business Brain says what it is for, so the
-- organisation's brains read as named brains with a purpose: "Sales brain:
-- answers the sales team from our processes and experience".
--
--   business_brain_chatbots.purpose   what the brain is for, at most 1000 characters
--
-- Every chatbot already made keeps its row and gets an empty purpose, which
-- reads as "no purpose given yet". A manager of the organisation, with the
-- module on, may now change a chatbot's purpose, and nothing else on its row:
-- a trigger keeps its name, maker and dates as they were made. No policy
-- deletes a row. The limit matches businessBrainChatbotLimits.longestPurpose
-- (businessBrainChatbotRules.ts).
--
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

alter table public.business_brain_chatbots
	add column if not exists purpose text not null default '' check (char_length(purpose) <= 1000);

create or replace function public.business_brain_chatbots_keep_all_but_purpose()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if (to_jsonb(new) - 'purpose') <> (to_jsonb(old) - 'purpose') then
		raise exception 'A chatbot is kept as it was made; its purpose is the only change.';
	end if;
	return new;
end;
$$;

create or replace trigger business_brain_chatbots_keep_all_but_purpose
	before update on public.business_brain_chatbots
	for each row execute function public.business_brain_chatbots_keep_all_but_purpose();

drop policy if exists "managers with the module say what chatbots are for" on public.business_brain_chatbots;
create policy "managers with the module say what chatbots are for" on public.business_brain_chatbots
	for update using (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	) with check (
		public.can_use_organisation_module(organisation_id, 'business_brain')
		and public.can_manage_organisation(organisation_id)
	);

commit;
