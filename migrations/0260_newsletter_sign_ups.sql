-- 0260: the email addresses that signed up for YBT Weekly on yourbusiness.today.
--
-- Jeremy, 16 Nov 2026, looking at the site's footer: "Where is the newsletter
-- button?" The footer and /newsletter now take an email address for YBT Weekly.
-- Each one is kept here and handed on to the newsletter's beehiiv publication;
-- forwarded_to_newsletter_at says when beehiiv took it, and stays empty until the
-- site holds the beehiiv key, so the ones before it are handed on afterwards.
--
-- The address is kept in lower case and once. Its limit mirrors
-- src/lib/data/newsletterSignUp.ts, which the sign-up checks before writing.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.newsletter_sign_ups (
	id uuid primary key default gen_random_uuid(),
	email text not null check (char_length(email) between 3 and 254 and email = lower(email)),
	signed_up_at timestamptz not null default now(),
	forwarded_to_newsletter_at timestamptz,
	constraint newsletter_sign_ups_once_per_email unique (email)
);

create index if not exists newsletter_sign_ups_waiting
	on public.newsletter_sign_ups (signed_up_at)
	where forwarded_to_newsletter_at is null;

alter table public.newsletter_sign_ups enable row level security;

drop policy if exists "project managers read newsletter sign-ups" on public.newsletter_sign_ups;
create policy "project managers read newsletter sign-ups" on public.newsletter_sign_ups
	for select using (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
