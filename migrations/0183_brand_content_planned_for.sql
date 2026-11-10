-- 0183: a piece of a brand's content carries the day and time it is planned to go out.
--
-- The month's plan lays every piece out on the day it goes out. Until now a
-- piece only had a day once it was approved and scheduled (scheduled_for), so an
-- idea could not be written down for a day before any script existed. planned_for
-- is that day and time, held from the idea onwards; once a piece is scheduled,
-- scheduled_for is the day it goes out and the plan reads that first.
--
-- The stage check already allows 'idea' (0168), so it is not made again here.
-- brand_content_pieces is new in the same deploy and holds no live rows; the
-- column is nullable, so every row already there keeps what it holds.
--
-- Additive and safe to re-run.

begin;

alter table public.brand_content_pieces
	add column if not exists planned_for timestamptz;

create index if not exists brand_content_pieces_planned_for_idx
	on public.brand_content_pieces (organisation_id, planned_for);

create index if not exists brand_content_pieces_scheduled_for_idx
	on public.brand_content_pieces (organisation_id, scheduled_for);

commit;

notify pgrst, 'reload schema';
