-- 0262: Sales is switched on for Your Business Today's own organisation.
--
-- The Leads, Clients and Leaderboard pages, and the connector's register
-- actions, now answer only where the organisation has its Sales module
-- switched on (James, 16 Nov 2026: Conservaqua had Sales off and still showed
-- them). Every record on a sales register so far is Your Business Today's
-- (0207), so its own Sales is switched on here, or its team would lose its
-- registers the moment the code went live.
--
-- One row, written once: the record of applied migrations keeps it from
-- running again, so switching Sales off later stays off. Additive and safe to
-- re-run. It gives up within seconds rather than wait on a lock.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

insert into public.organisation_modules (organisation_id, module, is_on)
select public.your_business_today_organisation_id(), 'sales', true
where public.your_business_today_organisation_id() is not null
on conflict (organisation_id, module) do update set is_on = true, switched_at = now();

commit;
