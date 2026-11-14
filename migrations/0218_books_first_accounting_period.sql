-- 0218: the books know a new company's first accounting period.
--
-- A company's first accounts run from the day it was formed to its first year
-- end, which is longer than twelve months: Your Business Today's run from
-- 9 July 2026 to 31 July 2027. Knowing only the month a year starts in, the
-- profit and loss's year to date started on 1 August 2026 and left out July.
--
--   books_settings.first_period_start   the first day of the first period
--   books_settings.first_period_end     its last day, the day before a
--                                       financial year starts
--
-- Both or neither: books that set neither read exactly as before. The service
-- refuses by name an end before the start, a first period longer than 18
-- months, and an end that is not the day before the year's start month; the
-- check below holds the pair and their order.
--
-- Additive and safe to re-run: the columns are added only when they are not
-- there, empty for every organisation, and the check replaces itself. No row
-- is changed and nothing is dropped but the check this file makes.

begin;

alter table public.books_settings
	add column if not exists first_period_start date,
	add column if not exists first_period_end date;

alter table public.books_settings
	drop constraint if exists books_settings_first_period_check;

alter table public.books_settings
	add constraint books_settings_first_period_check check (
		(first_period_start is null) = (first_period_end is null)
		and (first_period_end is null or first_period_end >= first_period_start)
	);

commit;
